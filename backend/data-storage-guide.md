# Data Storage Guide - Emergency Response System

## 📁 Where Everything is Saved

### 1. **Emergency Events (In-Memory)**
**Location:** `ALLINONE/backend/app.js` (lines 40-45)
```javascript
// In-memory emergency events for MVP
let emergencyEvents = [];
```
- **What:** Active emergency events, user reports, AI analysis results
- **Format:** JavaScript array in server memory
- **Persistence:** Lost when server restarts (for MVP)

### 2. **Uploaded Media Files**
**Location:** `ALLINONE/backend/uploads/`
- **What:** Emergency photos, videos, audio recordings
- **Format:** Original file format (.webm, .mp4, .jpg, etc.)
- **Naming:** `timestamp-originalname.ext`
- **Examples:**
  - `1750359825992-emergency_recording.webm`
  - `1750359812545-emergency_recording.webm`

### 3. **Environment Configuration**
**Location:** `ALLINONE/backend/.env`
- **What:** API keys, server settings, contact numbers
- **Format:** Key-value pairs
- **Example:**
  ```
  OPENAI_API_KEY=sk-your-key-here
  TWILIO_ACCOUNT_SID=your-sid
  PORT=5000
  ```

### 4. **AI Analysis Results**
**Location:** In-memory + Real-time emission
- **What:** Emergency categorization, severity assessment, recommendations
- **Format:** JSON objects
- **Example:**
  ```json
  {
    "category": "MEDICAL",
    "severity": "HIGH",
    "priority": "URGENT",
    "actionItems": ["Call ambulance", "Stay calm"],
    "confidence": 0.9
  }
  ```

### 5. **Socket.io Real-time Data**
**Location:** Active connections in memory
- **What:** Live emergency updates, notifications, status changes
- **Format:** WebSocket events
- **Channels:**
  - `newEmergency` - New emergency created
  - `emergencyAnalysis` - AI analysis results
  - `emergencyNotification` - Urgent notifications

## 🔄 Data Flow

### Emergency Creation:
1. **User Input** → Frontend (React/Next.js)
2. **API Call** → Backend (Express.js)
3. **AI Analysis** → OpenAI API
4. **Storage** → In-memory array
5. **Real-time** → Socket.io broadcast
6. **Media** → File system (uploads/)

### Data Retrieval:
1. **Dashboard** → API calls to `/api/emergencies`
2. **Real-time** → Socket.io listeners
3. **Media** → Static file serving from `/uploads/`

## 📊 Current Data Types

### Emergency Events:
- User role (Women, Senior, Children, Layman)
- Location coordinates
- Emergency description
- AI analysis results
- Timestamp
- Status (ACTIVE, RESOLVED)
- Media URLs

### AI Analysis:
- Category (MEDICAL, FIRE, SECURITY, etc.)
- Severity (LOW, MEDIUM, HIGH, CRITICAL)
- Priority (LOW, NORMAL, URGENT, IMMEDIATE)
- Recommended services
- Action items
- Confidence score
- Response time estimate

## 🚀 Future Database Integration

For production, you would add:
- **MongoDB/PostgreSQL** for persistent storage
- **Redis** for real-time data caching
- **Cloud storage** (AWS S3) for media files
- **Backup systems** for data recovery

## 📝 Testing Data

Run these commands to see data in action:
```bash
# Test basic chatbot
npm run test:basic

# Test AI analysis
npm run test:ai

# Test emergency creation
npm run test:simple
``` 