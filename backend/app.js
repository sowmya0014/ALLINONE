const express = require('express');
const cors = require('cors');
require('dotenv').config();
const axios = require('axios');
const twilio = require('twilio');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const http = require('http');
const socketIo = require('socket.io');
const EmergencyAnalysisEngine = require('./emergencyAnalysisEngine');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
const EMERGENCY_CONTACT_NUMBER = process.env.EMERGENCY_CONTACT_NUMBER;
let twilioClient = null;
if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
}

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// In-memory emergency events for MVP
let emergencyEvents = [];

// Initialize Emergency Analysis Engine
let emergencyEngine;
try {
  if (process.env.OPENAI_API_KEY) {
    emergencyEngine = new EmergencyAnalysisEngine();
    console.log('Emergency Analysis Engine initialized successfully');
  } else {
    console.log('OpenAI API key not found - running in fallback mode');
    emergencyEngine = null;
  }
} catch (error) {
  console.error('Failed to initialize Emergency Analysis Engine:', error);
  console.log('Running in fallback mode without AI analysis');
  emergencyEngine = null;
}

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/emergencydb';
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Emergency Schema
const emergencySchema = new mongoose.Schema({
  description: String,
  location: {
    lat: Number,
    lng: Number
  },
  userRole: String,
  emergencyType: String,
  contactInfo: {
    name: String,
    phone: String
  },
  aiAnalysis: Object,
  timestamp: { type: Date, default: Date.now },
  status: { type: String, default: 'ACTIVE' },
  priority: String,
  recommendedServices: [String],
  mediaUrl: String
});
const Emergency = mongoose.model('Emergency', emergencySchema);

async function notifyEmergency({ role, location }) {
  if (!twilioClient || !TWILIO_PHONE_NUMBER || !EMERGENCY_CONTACT_NUMBER) return;
  const msg = `EMERGENCY ALERT\nRole: ${role}\nLocation: ${location ? location.lat + ',' + location.lng : 'N/A'}`;
  // Send SMS
  await twilioClient.messages.create({
    body: msg,
    from: TWILIO_PHONE_NUMBER,
    to: EMERGENCY_CONTACT_NUMBER
  });
  // Place a call (optional, simple message)
  await twilioClient.calls.create({
    twiml: `<Response><Say voice='alice'>Emergency alert for ${role}. Please check your messages or app for location.</Say></Response>`,
    from: TWILIO_PHONE_NUMBER,
    to: EMERGENCY_CONTACT_NUMBER
  });
}

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    services: {
      emergencyEngine: emergencyEngine ? 'ACTIVE' : 'FALLBACK_MODE',
      socketIo: 'ACTIVE',
      fileUpload: 'ACTIVE'
    }
  });
});

app.post('/api/emergency', async (req, res) => {
  try {
    const { description, location, userRole, emergencyType, contactInfo } = req.body;
    
    let aiAnalysis;
    
    if (emergencyEngine) {
      aiAnalysis = await emergencyEngine.analyzeEmergency({
        description,
        location,
        userRole
      });
    } else {
      aiAnalysis = {
        success: true,
        analysis: {
          category: 'UNKNOWN',
          severity: 'MEDIUM',
          priority: 'NORMAL',
          description: description,
          actionItems: ['Stay calm', 'Call emergency services if needed'],
          estimatedResponseTime: '10-15 minutes',
          confidence: 0.5
        }
      };
    }

    // Prepare emergency data
    const emergencyData = {
      description,
      location,
      userRole,
      emergencyType,
      contactInfo,
      aiAnalysis: aiAnalysis.analysis,
      timestamp: new Date(),
      status: 'ACTIVE',
      priority: aiAnalysis.analysis.priority,
      recommendedServices: aiAnalysis.analysis.recommendedServices || ['emergency_services']
    };

    // Save to MongoDB
    const newEmergency = new Emergency(emergencyData);
    await newEmergency.save();

    // Emit to all connected clients
    io.emit('newEmergency', {
      type: 'EMERGENCY_CREATED',
      data: newEmergency
    });

    // Send intelligent notifications based on AI analysis
    if (aiAnalysis.analysis.priority === 'IMMEDIATE' || aiAnalysis.analysis.priority === 'URGENT') {
      const notificationData = {
        message: `URGENT: ${aiAnalysis.analysis.category} Emergency`,
        details: aiAnalysis.analysis.description,
        location: location,
        priority: aiAnalysis.analysis.priority,
        recommendedActions: aiAnalysis.analysis.actionItems,
        estimatedResponseTime: aiAnalysis.analysis.estimatedResponseTime
      };
      io.emit('emergencyNotification', notificationData);
    }

    res.json({
      success: true,
      emergency: newEmergency,
      analysis: aiAnalysis.analysis
    });

  } catch (error) {
    console.error('Emergency API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process emergency' 
    });
  }
});

// Update mediaUrl for an event
app.patch('/api/emergency/:id', (req, res) => {
  const { id } = req.params;
  const { mediaUrl } = req.body;
  const event = emergencyEvents.find(e => e.id === id);
  if (event) {
    event.mediaUrl = mediaUrl;
    io.emit('emergency', event); // re-emit updated event
    return res.json({ success: true });
  }
  res.status(404).json({ error: 'Event not found' });
});

// Endpoint to get all emergencies (for dashboard refresh)
app.get('/api/emergencies', async (req, res) => {
  try {
    const emergencies = await Emergency.find().sort({ timestamp: -1 }).limit(100);
    res.json(emergencies);
  } catch (error) {
    console.error('Emergencies API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch emergencies' 
    });
  }
});

// Simple Chatbot API (No AI dependencies)
app.post('/api/chatbot', (req, res) => {
  try {
    const { message } = req.body;
    
    console.log('Chatbot received message:', message);
    
    if (!message) {
      return res.status(400).json({ 
        intent: 'error', 
        response: 'Please provide a message.' 
      });
    }
    
    const lowerMessage = message.toLowerCase();
    let intent = 'unknown';
    let responseText = "Hello! I'm your emergency assistant. How can I help you today?";
    
    // Simple keyword-based responses
    if (/hello|hi|hey/i.test(lowerMessage)) {
      intent = 'greeting';
      responseText = 'Hello! I\'m your emergency assistant. I can help you with emergency reporting, location sharing, and safety tips. What do you need?';
    } else if (/help|assist|support/i.test(lowerMessage)) {
      intent = 'help';
      responseText = 'I\'m here to help! I can assist with emergency reporting, calling contacts, sharing location, recording media, and providing safety guidance. What would you like to do?';
    } else if (/emergency|urgent|danger|sos/i.test(lowerMessage)) {
      intent = 'trigger_emergency';
      responseText = '🚨 EMERGENCY DETECTED! I\'ve identified this as an emergency situation. Please stay calm and help is on the way. I\'m calling emergency services now.';
    } else if (/call|phone|dial/i.test(lowerMessage)) {
      intent = 'call_contact';
      responseText = 'I can help you call your emergency contacts. Would you like me to call someone?';
    } else if (/location|where am i|send location/i.test(lowerMessage)) {
      intent = 'send_location';
      responseText = 'I can help you share your location with emergency services. Should I send your current location?';
    } else if (/record|video|audio|photo/i.test(lowerMessage)) {
      intent = 'record_media';
      responseText = 'I can help you record video or audio for emergency documentation. Would you like to start recording?';
    } else if (/safety|tips|advice/i.test(lowerMessage)) {
      intent = 'safety_tips';
      responseText = 'Here are some safety tips: Always keep emergency contacts handy, know your location, stay calm in emergencies, and call official emergency services (112 in India) for real emergencies.';
    } else if (/how are you|how do you do/i.test(lowerMessage)) {
      intent = 'greeting';
      responseText = 'I\'m functioning well and ready to help with any emergency situation. How can I assist you today?';
    } else if (/what can you do|capabilities|features/i.test(lowerMessage)) {
      intent = 'help';
      responseText = 'I can help you with: Emergency reporting, calling contacts, sharing location, recording media, providing safety tips, and analyzing emergency situations. Just let me know what you need!';
    } else {
      intent = 'general';
      responseText = 'I\'m your emergency assistant. You can ask me to call contacts, share location, record media, or report emergencies. How can I help you?';
    }

    const response = { 
      intent, 
      response: responseText 
    };

    console.log('Chatbot response:', response);
    res.json(response);

  } catch (error) {
    console.error('Chatbot API Error:', error);
    res.status(500).json({ 
      intent: 'error', 
      response: 'Sorry, I encountered an error. Please try again or call emergency services directly.' 
    });
  }
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No file uploaded' 
      });
    }

    const fileData = {
      filename: req.file.filename,
      originalname: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype
    };

    // If it's an image, analyze it for emergency context
    if (req.file.mimetype.startsWith('image/')) {
      const imageAnalysis = await emergencyEngine.analyzeImage(req.file.path);
      fileData.analysis = imageAnalysis;
    }

    res.json({
      success: true,
      file: fileData
    });

  } catch (error) {
    console.error('Upload API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to upload file' 
    });
  }
});

// Emergency Analysis API
app.post('/api/emergency/analyze', async (req, res) => {
  try {
    const { description, audio, image, location, userRole } = req.body;
    
    if (!description) {
      return res.status(400).json({ 
        success: false, 
        error: 'Emergency description is required' 
      });
    }

    let analysis;
    
    if (emergencyEngine) {
      // Use AI engine if available
      analysis = await emergencyEngine.analyzeEmergency({
        description,
        audio,
        image,
        location,
        userRole
      });
    } else {
      // Fallback analysis without AI
      const lowerDesc = description.toLowerCase();
      let category = 'UNKNOWN';
      let severity = 'MEDIUM';
      
      if (lowerDesc.includes('heart') || lowerDesc.includes('pain') || lowerDesc.includes('bleeding')) {
        category = 'MEDICAL';
      } else if (lowerDesc.includes('fire') || lowerDesc.includes('smoke')) {
        category = 'FIRE';
      } else if (lowerDesc.includes('attack') || lowerDesc.includes('threat')) {
        category = 'SECURITY';
      } else if (lowerDesc.includes('car') || lowerDesc.includes('crash')) {
        category = 'ACCIDENT';
      }
      
      if (lowerDesc.includes('urgent') || lowerDesc.includes('emergency')) {
        severity = 'HIGH';
      }
      
      analysis = {
        success: true,
        analysis: {
          category,
          severity,
          priority: severity === 'HIGH' ? 'URGENT' : 'NORMAL',
          actionItems: ['Stay calm', 'Call emergency services if needed'],
          estimatedResponseTime: '5-10 minutes',
          confidence: 0.6
        }
      };
    }

    // Emit real-time update to connected clients
    io.emit('emergencyAnalysis', {
      type: 'NEW_ANALYSIS',
      data: analysis
    });

    res.json(analysis);
    
  } catch (error) {
    console.error('Emergency Analysis API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to analyze emergency' 
    });
  }
});

// Get Emergency Analysis History
app.get('/api/emergency/analysis/history', async (req, res) => {
  try {
    // In production, fetch from database
    const history = [
      {
        id: 'EMG-1234567890',
        category: 'MEDICAL',
        severity: 'HIGH',
        timestamp: new Date().toISOString(),
        status: 'RESOLVED'
      }
    ];

    res.json({
      success: true,
      history: history
    });

  } catch (error) {
    console.error('History API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch history' 
    });
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('joinEmergencyRoom', (data) => {
    socket.join('emergency-room');
    console.log(`Client ${socket.id} joined emergency room`);
  });

  socket.on('emergencyUpdate', (data) => {
    io.to('emergency-room').emit('emergencyUpdate', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.use('/uploads', express.static(uploadDir));

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend is working!',
    timestamp: new Date().toISOString(),
    emergencyEngine: emergencyEngine ? 'ACTIVE' : 'FALLBACK_MODE'
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Emergency Analysis Engine: ACTIVE');
}); 