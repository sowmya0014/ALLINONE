# 🚨 ALLINONE Emergency Response System

A comprehensive emergency response website with **AI-powered analysis** for different user roles (Women, Senior Citizens, Children, Layman) featuring real-time emergency detection, intelligent categorization, and smart response coordination.

## ✨ Features

### 🤖 AI-Powered Emergency Analysis
- **Intelligent Emergency Detection** - AI analyzes emergency descriptions
- **Smart Categorization** - Automatically categorizes emergencies (Medical, Fire, Security, Accident, Natural Disaster)
- **Severity Assessment** - Determines urgency and priority levels
- **Action Recommendations** - Provides specific guidance based on emergency type
- **Response Time Estimation** - Calculates expected emergency response times

### 🎯 Role-Based Interfaces
- **Women's Safety** - Enhanced security features and emergency protocols
- **Senior Citizens** - Medical emergency focus with hospital mapping
- **Children** - Simplified interface with guardian notifications
- **Layman** - Contact management and voice assistant

### 🚀 Real-Time Features
- **Live Emergency Tracking** - Real-time emergency monitoring
- **Smart Notifications** - AI-enhanced alert system
- **Voice Commands** - Hands-free emergency reporting
- **Media Upload** - Photo/video emergency documentation
- **Location Sharing** - Automatic GPS location detection

### 🏥 Hospital Integration
- **Real Hospital Data** - Uppal to Ghatkesar area hospitals
- **Status Monitoring** - Open/Closed/24-7 status tracking
- **Navigation Links** - Direct Google Maps integration
- **Radius Filtering** - Find hospitals within specified distance

## 🛠️ Tech Stack

- **Frontend**: Next.js, React, Socket.io-client
- **Backend**: Node.js, Express, Socket.io
- **AI Engine**: OpenAI GPT-4, Custom Emergency Analysis
- **Real-time**: WebSocket communication
- **Notifications**: Twilio SMS/Call integration
- **Maps**: Google Maps API
- **Media**: WebRTC recording, file upload

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- OpenAI API key
- Twilio credentials (optional)

### 1. Clone and Setup
```bash
git clone <your-repo-url>
cd ALLINONE
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file:
```env
PORT=5000
OPENAI_API_KEY=your_openai_api_key_here
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

### 4. Start the Application
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Guardian Dashboard**: http://localhost:3000/guardian
- **Emergency Dashboard**: http://localhost:3000/emergency-dashboard

## 🎯 How to Use

### 1. Select Your Role
Choose from Women, Senior Citizens, Children, or Layman based on your needs.

### 2. Report an Emergency
- **Text Description**: Describe the emergency situation
- **AI Analysis**: Click "🤖 AI Analysis" for intelligent assessment
- **Voice Recording**: Use voice commands for hands-free reporting
- **Media Upload**: Add photos/videos for better context

### 3. AI Analysis Results
The system will provide:
- **Emergency Category** (Medical, Fire, Security, etc.)
- **Severity Level** (Low, Medium, High, Critical)
- **Priority Status** (Normal, Urgent, Immediate)
- **Recommended Actions** (Specific guidance)
- **Response Time** (Estimated arrival time)

### 4. Emergency Submission
After AI analysis, submit the emergency for:
- **Automatic Service Routing** (Ambulance, Police, Fire)
- **Real-time Notifications** to emergency contacts
- **Live Tracking** for response coordination

## 🔧 API Endpoints

### Emergency Analysis
- `POST /api/emergency/analyze` - AI emergency analysis
- `POST /api/emergency` - Submit emergency with AI insights
- `GET /api/emergency/analysis/history` - Analysis history

### Chatbot
- `POST /api/chatbot` - AI-powered emergency assistant

### Media
- `POST /api/upload` - Upload emergency media files

### Real-time
- WebSocket connection for live updates
- Emergency notifications and status updates

## 🏥 Hospital Data

The system includes real hospital data for the Uppal to Ghatkesar area:
- **Hospital Names** and locations
- **Contact Information** and phone numbers
- **Operating Hours** and 24/7 status
- **Distance Calculation** from user location
- **Navigation Integration** with Google Maps

## 🔒 Security Features

- **Role-based Access** - Different interfaces for different users
- **Location Privacy** - Secure location sharing
- **Data Encryption** - Secure data transmission
- **Accessibility** - High contrast, text size controls, night mode

## 🌐 Multi-language Support

- **English** - Primary language
- **Hindi** - हिन्दी support
- **Telugu** - తెలుగు support

## 📱 PWA Features

- **Offline Support** - Basic functionality without internet
- **Installable** - Add to home screen
- **Push Notifications** - Emergency alerts
- **Responsive Design** - Works on all devices

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Emergency Contact

For real emergencies, always call your local emergency services:
- **India**: 112 (Unified Emergency Number)
- **Medical**: 108 (Ambulance)
- **Police**: 100
- **Fire**: 101

---

**⚠️ Important**: This is a demonstration system. For real emergencies, always contact official emergency services immediately. 