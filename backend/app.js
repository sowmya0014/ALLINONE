const express = require('express');
const cors = require('cors');
require('dotenv').config();
const axios = require('axios');
const twilio = require('twilio');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

const http = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(http, {
  cors: { origin: '*' }
});

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
  res.json({ status: 'ok', message: 'ALLINONE backend running' });
});

app.post('/api/emergency', async (req, res) => {
  const { role, location, mediaUrl } = req.body;
  console.log(`EMERGENCY TRIGGERED: role=${role}, location=${JSON.stringify(location)}`);
  const event = { id: Date.now().toString(), role, location, timestamp: Date.now(), mediaUrl };
  emergencyEvents.unshift(event);
  io.emit('emergency', event);
  // Notify via Twilio
  try {
    await notifyEmergency({ role, location });
  } catch (e) {
    console.error('Twilio notification error:', e.message);
  }
  res.json({ success: true, id: event.id });
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
app.get('/api/emergencies', (req, res) => {
  res.json(emergencyEvents);
});

app.post('/api/chatbot', async (req, res) => {
  const { message } = req.body;
  if (OPENAI_API_KEY) {
    try {
      const prompt = `You are an emergency response assistant. For the user's message, reply with a JSON object with two fields: 'intent' (one of: call_contact, send_location, record_media, trigger_emergency, unknown) and 'response' (a helpful, concise reply in the same language as the user).\nUser: ${message}\nBot:`;
      const completion = await axios.post('https://api.openai.com/v1/completions', {
        model: 'text-davinci-003',
        prompt,
        max_tokens: 100,
        temperature: 0.2,
        stop: ['\n']
      }, {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      let result = completion.data.choices[0].text.trim();
      // Try to parse JSON
      let intent = 'unknown', responseText = "I'm not sure how to help with that.";
      try {
        const parsed = JSON.parse(result);
        intent = parsed.intent || 'unknown';
        responseText = parsed.response || responseText;
      } catch (e) {
        responseText = result;
      }
      return res.json({ intent, response: responseText });
    } catch (err) {
      console.error('OpenAI error:', err.message);
      return res.status(500).json({ intent: 'unknown', response: 'AI error. Please try again.' });
    }
  }
  // Fallback: rule-based
  let intent = 'unknown';
  let response = "I'm not sure how to help with that.";
  if (/call|phone|dial/i.test(message)) {
    intent = 'call_contact';
    response = 'Calling your emergency contact...';
  } else if (/location|where am i|send location/i.test(message)) {
    intent = 'send_location';
    response = 'Sending your location...';
  } else if (/record|video|audio/i.test(message)) {
    intent = 'record_media';
    response = 'Recording video/audio...';
  } else if (/help|emergency|sos/i.test(message)) {
    intent = 'trigger_emergency';
    response = 'Triggering emergency mode!';
  }
  res.json({ intent, response });
});

app.post('/api/upload', upload.single('media'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

io.on('connection', (socket) => {
  console.log('Guardian/Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.use('/uploads', express.static(uploadDir));

const PORT = process.env.PORT || 4000;
http.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
}); 