import React, { useState, useRef, useEffect } from 'react';
import { useAccessibility, useLanguage } from './_app';

const roles = [
  { label: 'Woman', value: 'woman' },
  { label: 'Child', value: 'child' },
  { label: 'Senior', value: 'senior' },
  { label: 'Layman', value: 'layman' },
];

const hospitalDemoData = [
  { name: 'City Hospital', lat: 17.385, lng: 78.4867, status: 'open', contact: '+91-1234567890', is247: true },
  { name: 'General Hospital', lat: 17.39, lng: 78.48, status: 'closed', contact: '+91-9876543210', is247: false },
  { name: 'Apollo Clinic', lat: 17.38, lng: 78.49, status: 'open', contact: '+91-1122334455', is247: false },
  { name: 'Sunrise Hospital', lat: 17.37, lng: 78.47, status: 'open', contact: '+91-9988776655', is247: true },
];

const policeDemoData = [
  { name: 'SR Nagar Police Station', lat: 17.4422, lng: 78.4483, contact: '+91-1234567891', is247: true, address: 'SR Nagar, Hyderabad' },
  { name: 'Panjagutta Police Station', lat: 17.4325, lng: 78.4487, contact: '+91-1234567892', is247: true, address: 'Panjagutta, Hyderabad' },
  { name: 'Ameerpet Police Outpost', lat: 17.4375, lng: 78.4480, contact: '+91-1234567893', is247: false, address: 'Ameerpet, Hyderabad' },
  { name: 'Begumpet Police Station', lat: 17.4445, lng: 78.4600, contact: '+91-1234567894', is247: true, address: 'Begumpet, Hyderabad' },
];

function SeniorMap({ userLocation, hospitals }) {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  useEffect(() => {
    if (window.google && mapRef.current && !map) {
      const m = new window.google.maps.Map(mapRef.current, {
        center: userLocation || { lat: 17.385, lng: 78.4867 },
        zoom: userLocation ? 13 : 11,
      });
      setMap(m);
    }
  }, [userLocation, map]);
  useEffect(() => {
    if (map && hospitals) {
      hospitals.forEach(h => {
        const marker = new window.google.maps.Marker({
          position: { lat: h.lat, lng: h.lng },
          map,
          title: h.name,
          label: h.is247 ? '🟡' : h.status === 'open' ? '🟢' : '🔴',
        });
      });
      if (userLocation) {
        new window.google.maps.Marker({
          position: userLocation,
          map,
          title: 'Your Location',
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 7,
            fillColor: '#1976d2',
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: '#fff',
          },
        });
      }
    }
  }, [map, hospitals, userLocation]);
  useEffect(() => {
    if (!window.google && !document.getElementById('senior-map-script')) {
      const script = document.createElement('script');
      script.id = 'senior-map-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
      script.async = true;
      script.onload = () => {};
      document.body.appendChild(script);
    }
  }, []);
  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
}

function MobileChatbotModal({ open, onClose, chatHistory, chatInput, setChatInput, sendChat, handleMic, micActive, quickReplies, onQuickReply, userLocation }) {
  if (!open) return null;
  return (
    <div className="chatbot-modal" onClick={onClose}>
      <div className="chatbot-sheet" onClick={e => e.stopPropagation()}>
        <div className="chatbot-header">
          🤖 AI Emergency Assistant
          <button style={{ float: 'right', background: 'none', border: 'none', fontSize: 24, color: '#888' }} onClick={onClose}>&times;</button>
        </div>
        <div className="chatbot-messages">
          {chatHistory.length === 0 && <div style={{ color: '#888' }}>Say something like "Call my son" or "Send my location"...</div>}
          {chatHistory.map((msg, idx) => (
            <div key={idx} style={{ textAlign: msg.from === 'user' ? 'right' : 'left', margin: '8px 0' }}>
              <b>{msg.from === 'user' ? 'You' : 'Bot'}:</b> {msg.text}
            </div>
          ))}
          {/* Map preview if location is available */}
          {userLocation && (
            <div style={{ margin: '16px 0', textAlign: 'center' }}>
              <b>📍 Your Location:</b>
              <div style={{ marginTop: 8 }}>
                <img
                  src={`https://maps.googleapis.com/maps/api/staticmap?center=${userLocation.lat},${userLocation.lng}&zoom=15&size=300x150&markers=color:red%7C${userLocation.lat},${userLocation.lng}&key=YOUR_GOOGLE_MAPS_API_KEY`}
                  alt="Map preview"
                  style={{ borderRadius: 8, maxWidth: '100%' }}
                />
                <div style={{ fontSize: 12, color: '#888' }}>{userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}</div>
              </div>
            </div>
          )}
        </div>
        <div className="chatbot-quick-replies">
          {quickReplies.map((txt, i) => (
            <button className="chatbot-chip" key={i} onClick={() => onQuickReply(txt)}>{txt}</button>
          ))}
        </div>
        <div className="chatbot-input-row">
          <input
            className="chatbot-input"
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            placeholder="Type your message..."
            onKeyDown={e => e.key === 'Enter' && sendChat()}
          />
          <button className="chatbot-send-btn" onClick={sendChat} title="Send">➤</button>
          <button className="chatbot-mic-btn" onClick={handleMic} title="Voice Input">{micActive ? '🎤' : '🎙️'}</button>
        </div>
      </div>
    </div>
  );
}

function PoliceMap({ userLocation, stations }) {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [circle, setCircle] = useState(null);
  useEffect(() => {
    if (window.google && mapRef.current && !map) {
      const m = new window.google.maps.Map(mapRef.current, {
        center: userLocation || { lat: 17.4422, lng: 78.4483 },
        zoom: userLocation ? 13 : 11,
      });
      setMap(m);
    }
  }, [userLocation, map]);
  useEffect(() => {
    if (map && stations) {
      stations.forEach(s => {
        new window.google.maps.Marker({
          position: { lat: s.lat, lng: s.lng },
          map,
          title: s.name,
          label: s.is247 ? '🟡' : '🟢',
        });
      });
      if (userLocation) {
        new window.google.maps.Marker({
          position: userLocation,
          map,
          title: 'Your Location',
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 7,
            fillColor: '#1976d2',
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: '#fff',
          },
        });
        // Draw/update circle
        if (circle) circle.setMap(null);
        const c = new window.google.maps.Circle({
          strokeColor: '#1976d2',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#1976d2',
          fillOpacity: 0.08,
          map,
          center: userLocation,
          radius: window.selectedRadius ? window.selectedRadius * 1000 : 5000,
        });
        setCircle(c);
      }
    }
  }, [map, stations, userLocation]);
  useEffect(() => {
    if (!window.google && !document.getElementById('police-map-script')) {
      const script = document.createElement('script');
      script.id = 'police-map-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
      script.async = true;
      script.onload = () => {};
      document.body.appendChild(script);
    }
  }, []);
  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
}

export default function Home() {
  const [role, setRole] = useState(null);
  const [emergencySent, setEmergencySent] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [listening, setListening] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [geoError, setGeoError] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [contacts, setContacts] = useState([
    { name: 'Son', phone: '+91-9876543210' },
    { name: 'Daughter', phone: '+91-9123456789' },
  ]);
  const [newContact, setNewContact] = useState({ name: '', phone: '' });
  const [laymanMsg, setLaymanMsg] = useState('');
  const [laymanVoiceListening, setLaymanVoiceListening] = useState(false);
  const [emergencyId, setEmergencyId] = useState(null);
  const [radius, setRadius] = useState(15);
  let recognition;
  if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
    recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
  }

  const { textSize, setTextSize, highContrast, setHighContrast, nightMode, setNightMode } = useAccessibility();
  const { lang, setLang, t } = useLanguage();

  const [showMobileChat, setShowMobileChat] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const recognitionRef = useRef(null);
  const quickReplies = [
    'Call emergency contact',
    'Send my location',
    'Record video',
    'Help',
    'Fire emergency',
    'Medical emergency',
    'Security threat'
  ];

  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [mediaRecorderRef2, setMediaRecorderRef2] = useState(null);
  const [recordingStream, setRecordingStream] = useState(null);

  const startRecording = async () => {
    setActionMsg('Recording video/audio...');
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    const chunks = [];
    
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const formData = new FormData();
      formData.append('file', blob, 'emergency-recording.webm');
      
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        setUploadedUrl('/api' + data.url);
        setActionMsg('Recording uploaded successfully!');
      } catch (err) {
        setActionMsg('Failed to upload recording: ' + err.message);
      }
    };
    
    mediaRecorder.start();
    setTimeout(() => {
      mediaRecorder.stop();
      stream.getTracks().forEach(track => track.stop());
    }, 5000);
  };

  const handleEmergency = async () => {
    setActionMsg('🚨 EMERGENCY TRIGGERED! Calling emergency services...');
    
    // Direct emergency call
    const emergencyNumber = '112'; // India's unified emergency number
    window.location.href = `tel:${emergencyNumber}`;
    
    // Also send emergency data to backend
    try {
      const res = await fetch('/api/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          role, 
          location: userLocation,
          mediaUrl: uploadedUrl,
          emergencyType: 'URGENT',
          description: 'Emergency triggered via voice command'
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEmergencyId(data.id);
      }
    } catch (err) {
      console.error('Emergency API error:', err);
    }
  };

  const handleEmergencyUpdate = async (emergencyId, status) => {
    try {
      fetch(`/api/emergency/${emergencyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
    } catch (err) {
      console.error('Failed to update emergency:', err);
    }
  };

  // After upload, PATCH emergency event with mediaUrl if needed
  useEffect(() => {
    if (uploadedUrl && emergencyId) {
      fetch(`/api/emergency/${emergencyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaUrl: uploadedUrl }),
      });
    }
  }, [uploadedUrl, emergencyId]);

  // Action handlers
  const handleCall = () => {
    setActionMsg('Calling emergency contact...');
    // Direct phone call functionality
    const phoneNumber = '+91-9876543210'; // Emergency contact
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleCallContact = (phoneNumber) => {
    setActionMsg(`Calling ${phoneNumber}...`);
    // Direct phone call to specific contact
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleSendLocation = () => {
    setActionMsg('Getting your location...');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const locationUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
          // Share location via SMS
          const message = `Emergency: My location is ${locationUrl}`;
          window.location.href = `sms:+91-9876543210?body=${encodeURIComponent(message)}`;
          setActionMsg('Location sent via SMS!');
        },
        (error) => {
          setActionMsg('Could not get location: ' + error.message);
        }
      );
    } else {
      setActionMsg('Geolocation not supported');
    }
  };

  const handleRecord = async () => {
    setActionMsg('Recording video/audio...');
    setRecordedBlob(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setRecordingStream(stream);
      const mediaRecorder = new window.MediaRecorder(stream);
      setMediaRecorderRef2(mediaRecorder);
      const chunks = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setRecordedBlob(blob);
        setIsRecording(false);
        setActionMsg('Recording complete. Preview below.');
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorder.start();
      setIsRecording(true);
      setActionMsg('Recording... Click Stop to finish.');
    } catch (err) {
      setActionMsg('Could not access camera/mic: ' + err.message);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef2) {
      mediaRecorderRef2.stop();
    }
  };

  const handleUploadRecording = async () => {
    if (!recordedBlob) return;
    setActionMsg('Uploading recording...');
    const formData = new FormData();
    formData.append('file', recordedBlob, 'emergency-recording.webm');
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setUploadedUrl('/api' + data.url);
      setActionMsg('Recording uploaded successfully!');
      setRecordedBlob(null);
    } catch (err) {
      setActionMsg('Failed to upload recording: ' + err.message);
    }
  };

  // Update sendChat with enhanced AI analysis
  const sendChat = async () => {
    if (!chatInput.trim()) return;
    
    setChatHistory((prev) => [...prev, { from: 'user', text: chatInput }]);
    
    try {
      console.log('Sending chat message:', chatInput);
      
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: chatInput, userRole: role }),
      });
      
      console.log('Chat response status:', res.status);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('Chat response data:', data);
      
      setChatHistory((prev) => [...prev, { from: 'bot', text: data.response }]);
      setChatInput('');
      
      // Enhanced action triggers based on AI analysis
      switch (data.intent) {
        case 'call_contact':
          handleCall();
          break;
        case 'send_location':
          handleSendLocation();
          break;
        case 'record_media':
          handleRecord();
          break;
        case 'trigger_emergency':
          handleEmergency();
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Chat error:', error);
      setChatHistory((prev) => [...prev, { 
        from: 'bot', 
        text: 'Sorry, I encountered an error. Please try again or call emergency services directly.' 
      }]);
      setChatInput('');
    }
  };

  const handleMic = () => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!recognitionRef.current) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';
      }
      const recognition = recognitionRef.current;
      setMicActive(true);
      recognition.start();
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setChatInput(transcript);
        setMicActive(false);
      };
      recognition.onerror = () => {
        setMicActive(false);
      };
      recognition.onend = () => {
        setMicActive(false);
      };
    } else {
      alert('Speech recognition not supported in this browser.');
    }
  };

  // For seniors: get location on dashboard load
  useEffect(() => {
    if (role === 'senior' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserLocation(null)
      );
    }
  }, [role]);

  // Enhanced Layman voice assistant with direct actions
  const handleLaymanVoice = () => {
    let recognition;
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      setLaymanVoiceListening(true);
      
      recognition.start();
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        setLaymanVoiceListening(false);
        
        // Enhanced voice command logic with direct actions
        if (transcript.includes('call') || transcript.includes('phone')) {
          const name = transcript.replace(/call|phone/gi, '').trim();
          const contact = contacts.find(c => c.name.toLowerCase().includes(name));
          if (contact) {
            setLaymanMsg(`Calling ${contact.name}...`);
            handleCallContact(contact.phone);
          } else {
            setLaymanMsg(`Contact '${name}' not found. Calling emergency contact...`);
            handleCall();
          }
        } else if (transcript.includes('emergency') || transcript.includes('help') || transcript.includes('sos')) {
          setLaymanMsg('🚨 EMERGENCY DETECTED! Calling emergency services...');
          handleEmergency();
        } else if (transcript.includes('location') || transcript.includes('where')) {
          setLaymanMsg('Sharing your location...');
          handleSendLocation();
        } else if (transcript.includes('record') || transcript.includes('video')) {
          setLaymanMsg('Starting emergency recording...');
          handleRecord();
        } else if (transcript.includes('youtube')) {
          setLaymanMsg('Opening YouTube...');
          window.open('https://www.youtube.com', '_blank');
        } else if (transcript.includes('good morning') || transcript.includes('hello')) {
          setLaymanMsg('Good morning! How can I help you today?');
        } else {
          setLaymanMsg(`Voice command: "${transcript}". Try saying: "Call Son", "Emergency", "Location", "Record"`);
        }
      };
      
      recognition.onerror = () => setLaymanVoiceListening(false);
      recognition.onend = () => setLaymanVoiceListening(false);
    } else {
      setLaymanMsg('Speech recognition not supported in this browser.');
    }
  };

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Filter hospitals by radius
  const filteredHospitals = hospitalDemoData.filter(h => {
    if (!userLocation) return true;
    const distance = calculateDistance(userLocation.lat, userLocation.lng, h.lat, h.lng);
    return distance <= radius;
  });

  // Navigate to hospital
  const navigateToHospital = (hospital) => {
    if (!userLocation) {
      alert('Please allow location access to get directions');
      return;
    }
    const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${hospital.lat},${hospital.lng}`;
    window.open(url, '_blank');
  };

  function handleQuickReply(txt) {
    if (txt === 'Send my location') {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const locMsg = `My location is: ${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
            setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            setChatInput(locMsg);
          },
          (err) => {
            setChatInput('Unable to fetch location.');
          }
        );
      } else {
        setChatInput('Geolocation not supported.');
      }
    } else {
      setChatInput(txt);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <h1>ALLINONE Emergency Response</h1>
      {!role ? (
        <div>
          {/* Language Selector */}
          <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
            <select value={lang} onChange={e => setLang(e.target.value)} style={{ fontSize: 18 }}>
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
              <option value="te">తెలుగు</option>
            </select>
          </div>
          <h2>{t.selectRole}</h2>
          {roles.map(r => (
            <button key={r.value} style={{ margin: 10, fontSize: 24, padding: '1em 2em' }} onClick={() => setRole(r.value)}>{r.label}</button>
          ))}
        </div>
      ) : (
        <div>
          {/* Accessibility Controls */}
          <div style={{ position: 'absolute', top: 20, right: 20, display: 'flex', gap: 8, zIndex: 10 }}>
            <button onClick={() => setTextSize(Math.max(0.7, textSize - 0.1))} title="Decrease text size" style={{ fontSize: 18 }}>A-</button>
            <button onClick={() => setTextSize(1)} title="Reset text size" style={{ fontSize: 18 }}>A</button>
            <button onClick={() => setTextSize(Math.min(2, textSize + 0.1))} title="Increase text size" style={{ fontSize: 18 }}>A+</button>
            <button onClick={() => setHighContrast(v => !v)} title="Toggle high contrast" style={{ fontSize: 18, background: highContrast ? '#000' : '#fff', color: highContrast ? '#fff' : '#000' }}>HC</button>
            <button onClick={() => setNightMode(v => !v)} title="Toggle night mode" style={{ fontSize: 18, background: nightMode ? '#222' : '#fff', color: nightMode ? '#fff' : '#000' }}>{nightMode ? '☀️' : '🌙'}</button>
            {/* Language Selector */}
            <select value={lang} onChange={e => setLang(e.target.value)} style={{ fontSize: 18 }}>
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
              <option value="te">తెలుగు</option>
            </select>
          </div>
          {/* Role-based dashboards: Layman, Senior, or Default (Women/Child) */}
          {role === 'layman' ? (
            <div>
              <h2>{t.emergencyDashboard} ({roles.find(r => r.value === role).label})</h2>
              {/* Contacts Section */}
              <div style={{ marginBottom: 24 }}>
                <h3>Contacts</h3>
                <ul style={{ padding: 0, listStyle: 'none' }}>
                  {contacts.map((c, i) => (
                    <li key={i} style={{ margin: '12px 0', padding: 12, background: '#f8fafc', borderRadius: 8, boxShadow: '0 1px 4px #0001', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontWeight: 600 }}>{c.name}</span>
                      <span style={{ color: '#555' }}>{c.phone}</span>
                      <button onClick={() => handleCallContact(c.phone)} style={{ marginLeft: 'auto', fontSize: 16, padding: '4px 12px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6 }}>Call</button>
                    </li>
                  ))}
                </ul>
                <form onSubmit={e => { e.preventDefault(); if (newContact.name && newContact.phone) { setContacts([...contacts, newContact]); setNewContact({ name: '', phone: '' }); }}} style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                  <input type="text" placeholder="Name" value={newContact.name} onChange={e => setNewContact({ ...newContact, name: e.target.value })} style={{ flex: 1, fontSize: 16, padding: 6, borderRadius: 4, border: '1px solid #ccc' }} />
                  <input type="text" placeholder="Phone" value={newContact.phone} onChange={e => setNewContact({ ...newContact, phone: e.target.value })} style={{ flex: 1, fontSize: 16, padding: 6, borderRadius: 4, border: '1px solid #ccc' }} />
                  <button type="submit" style={{ fontSize: 16, padding: '6px 16px', background: '#388e3c', color: '#fff', border: 'none', borderRadius: 6 }}>Add</button>
                </form>
              </div>
              <button style={{ fontSize: 32, padding: '1em 2em', background: 'red', color: 'white', border: 'none', borderRadius: 8 }} onClick={handleEmergency}>{t.emergency}</button>
              {geoError && <div style={{ color: 'red', marginTop: 10 }}>{geoError}</div>}
              {emergencySent && <div style={{ color: 'green', marginTop: 20 }}>{t.emergency} triggered!</div>}
              {recordingUrl && (
                <div style={{ marginTop: 20 }}>
                  <a href={recordingUrl} download="emergency_recording.webm">Download Emergency Recording</a>
                </div>
              )}
              {uploadedUrl && (
                <div style={{ marginTop: 20 }}>
                  <a href={uploadedUrl} target="_blank" rel="noopener noreferrer">View Uploaded Emergency Recording</a>
                </div>
              )}
              {/* Action Switches */}
              <div style={{ marginTop: 30, display: 'flex', gap: 16 }}>
                <button onClick={handleCall} style={{ fontSize: 20, padding: '0.7em 1.5em', background: '#1976d2', color: 'white', border: 'none', borderRadius: 8 }}>{t.callContact}</button>
                <button onClick={handleSendLocation} style={{ fontSize: 20, padding: '0.7em 1.5em', background: '#388e3c', color: 'white', border: 'none', borderRadius: 8 }}>{t.sendLocation}</button>
                {!isRecording && !recordedBlob && (
                  <button onClick={handleRecord} style={{ fontSize: 20, padding: '0.7em 1.5em', background: '#fbc02d', color: 'black', border: 'none', borderRadius: 8 }}>{t.recordMedia}</button>
                )}
                {isRecording && (
                  <button onClick={handleStopRecording} style={{ fontSize: 20, padding: '0.7em 1.5em', background: 'red', color: 'white', border: 'none', borderRadius: 8 }}>Stop Recording</button>
                )}
                {recordedBlob && (
                  <>
                    <button onClick={handleUploadRecording} style={{ fontSize: 20, padding: '0.7em 1.5em', background: '#388e3c', color: 'white', border: 'none', borderRadius: 8 }}>Upload Recording</button>
                    <button onClick={() => { setRecordedBlob(null); setActionMsg('Recording discarded.'); }} style={{ fontSize: 20, padding: '0.7em 1.5em', background: '#eee', color: '#222', border: '1px solid #ccc', borderRadius: 8 }}>Discard</button>
                  </>
                )}
              </div>
              {recordedBlob && (
                <div style={{ marginTop: 16 }}>
                  <video src={URL.createObjectURL(recordedBlob)} controls style={{ maxWidth: 320, borderRadius: 8 }} />
                  <div style={{ color: '#888', fontSize: 14 }}>Preview before upload</div>
                </div>
              )}
              {actionMsg && <div style={{ marginTop: 16, color: '#333', fontWeight: 'bold' }}>{actionMsg}</div>}
              <div style={{ marginTop: 40, width: 400, maxWidth: '90%' }}>
                <h3>{t.aiChatbot}</h3>
                <div style={{ background: '#fff', minHeight: 100, borderRadius: 8, padding: 16, marginBottom: 8, boxShadow: '0 2px 8px #0001' }}>
                  {chatHistory.length === 0 && <div style={{ color: '#888' }}>{t.saySomething}</div>}
                  {chatHistory.map((msg, idx) => (
                    <div key={idx} style={{ textAlign: msg.from === 'user' ? 'right' : 'left', margin: '8px 0' }}>
                      <b>{msg.from === 'user' ? t.user : t.bot}:</b> {msg.text}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex' }}>
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendChat()}
                    placeholder={t.typeMessage}
                    style={{ flex: 1, fontSize: 18, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
                  />
                  <button onClick={sendChat} style={{ marginLeft: 8, fontSize: 18, padding: '8px 16px' }}>{t.send}</button>
                  <button onClick={handleMic} style={{ marginLeft: 8, fontSize: 18, padding: '8px 12px', background: micActive ? '#ffd700' : '#eee', borderRadius: 4, border: '1px solid #ccc' }} title={t.speak}>
                    {micActive ? '🎤' : '🎙️'}
                  </button>
                </div>
              </div>
              {/* Hospital Finder Section */}
              <div style={{ marginTop: 48 }}>
                {/* Radius Filter */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>Search Radius:</span>
                    <input
                      type="range"
                      min="1"
                      max="15"
                      value={radius}
                      onChange={e => { setRadius(Number(e.target.value)); window.selectedRadius = Number(e.target.value); }}
                      style={{ width: 200 }}
                    />
                    <span>{radius} km</span>
                  </label>
                </div>
                {/* Hospital Status Legend */}
                <div style={{ marginBottom: 16, padding: 12, background: '#f8f9fa', borderRadius: 8, border: '1px solid #dee2e6', display: 'inline-block' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: 8 }}>Hospital Status:</div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 14 }}>
                    <span>🟢 <b>Open</b> - Currently accepting patients</span>
                    <span>🟡 <b>24/7</b> - Open 24 hours, 7 days a week</span>
                    <span>🔴 <b>Closed</b> - Currently not accepting patients</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginTop: 24 }}>
                  <div style={{ flex: 1, minWidth: 350, maxWidth: 600, height: 350, borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px #0001', background: '#fff', position: 'relative' }}>
                    {/* Map for seniors */}
                    <SeniorMap userLocation={userLocation} hospitals={filteredHospitals} />
                  </div>
                  <div style={{ flex: 1, minWidth: 300 }}>
                    <h3>Nearby Hospitals ({filteredHospitals.length})</h3>
                    <ul style={{ padding: 0, listStyle: 'none' }}>
                      {filteredHospitals.map((h, i) => {
                        const distance = userLocation ? calculateDistance(userLocation.lat, userLocation.lng, h.lat, h.lng) : null;
                        return (
                          <li key={i} style={{ margin: '16px 0', padding: 16, background: '#f8fafc', borderRadius: 8, boxShadow: '0 1px 4px #0001', display: 'flex', alignItems: 'center', gap: 12 }}>
                            <button
                              onClick={() => navigateToHospital(h)}
                              style={{ fontSize: 28, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                              title="Get directions"
                            >
                              {h.is247 ? '🟡' : h.status === 'open' ? '🟢' : '🔴'}
                            </button>
                            <div style={{ flex: 1 }}>
                              <b>{h.name}</b><br />
                              <span>Status: {h.is247 ? '24/7' : h.status === 'open' ? 'Open' : 'Closed'}</span><br />
                              <span>Contact: {h.contact}</span>
                              {distance && <br />}
                              {distance && <span style={{ color: '#1976d2' }}>Distance: {distance.toFixed(1)} km</span>}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                    {filteredHospitals.length === 0 && (
                      <div style={{ color: '#666', textAlign: 'center', marginTop: 20 }}>
                        No hospitals found within {radius} km radius.
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Always visible Back button */}
              <div style={{ marginTop: 30, textAlign: 'center' }}>
                <button onClick={() => setRole(null)} style={{ fontSize: 20, padding: '0.5em 2em', background: '#eee', color: '#222', border: '1px solid #ccc', borderRadius: 8 }}>{t.back}</button>
              </div>
            </div>
          ) : role === 'senior' ? (
            <>
              <h2>{t.emergencyDashboard} ({roles.find(r => r.value === role).label})</h2>
              {/* Contacts Section */}
              <div style={{ marginBottom: 24 }}>
                <h3>Contacts</h3>
                <ul style={{ padding: 0, listStyle: 'none' }}>
                  {contacts.map((c, i) => (
                    <li key={i} style={{ margin: '12px 0', padding: 12, background: '#f8fafc', borderRadius: 8, boxShadow: '0 1px 4px #0001', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontWeight: 600 }}>{c.name}</span>
                      <span style={{ color: '#555' }}>{c.phone}</span>
                      <button onClick={() => handleCallContact(c.phone)} style={{ marginLeft: 'auto', fontSize: 16, padding: '4px 12px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6 }}>Call</button>
                    </li>
                  ))}
                </ul>
                <form onSubmit={e => { e.preventDefault(); if (newContact.name && newContact.phone) { setContacts([...contacts, newContact]); setNewContact({ name: '', phone: '' }); }}} style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                  <input type="text" placeholder="Name" value={newContact.name} onChange={e => setNewContact({ ...newContact, name: e.target.value })} style={{ flex: 1, fontSize: 16, padding: 6, borderRadius: 4, border: '1px solid #ccc' }} />
                  <input type="text" placeholder="Phone" value={newContact.phone} onChange={e => setNewContact({ ...newContact, phone: e.target.value })} style={{ flex: 1, fontSize: 16, padding: 6, borderRadius: 4, border: '1px solid #ccc' }} />
                  <button type="submit" style={{ fontSize: 16, padding: '6px 16px', background: '#388e3c', color: '#fff', border: 'none', borderRadius: 6 }}>Add</button>
                </form>
              </div>
              <button style={{ fontSize: 32, padding: '1em 2em', background: 'red', color: 'white', border: 'none', borderRadius: 8 }} onClick={handleEmergency}>{t.emergency}</button>
              {geoError && <div style={{ color: 'red', marginTop: 10 }}>{geoError}</div>}
              {emergencySent && <div style={{ color: 'green', marginTop: 20 }}>{t.emergency} triggered!</div>}
              {recordingUrl && (
                <div style={{ marginTop: 20 }}>
                  <a href={recordingUrl} download="emergency_recording.webm">Download Emergency Recording</a>
                </div>
              )}
              {uploadedUrl && (
                <div style={{ marginTop: 20 }}>
                  <a href={uploadedUrl} target="_blank" rel="noopener noreferrer">View Uploaded Emergency Recording</a>
                </div>
              )}
              {/* Action Switches */}
              <div style={{ marginTop: 30, display: 'flex', gap: 16 }}>
                <button onClick={handleCall} style={{ fontSize: 20, padding: '0.7em 1.5em', background: '#1976d2', color: 'white', border: 'none', borderRadius: 8 }}>{t.callContact}</button>
                <button onClick={handleSendLocation} style={{ fontSize: 20, padding: '0.7em 1.5em', background: '#388e3c', color: 'white', border: 'none', borderRadius: 8 }}>{t.sendLocation}</button>
                {!isRecording && !recordedBlob && (
                  <button onClick={handleRecord} style={{ fontSize: 20, padding: '0.7em 1.5em', background: '#fbc02d', color: 'black', border: 'none', borderRadius: 8 }}>{t.recordMedia}</button>
                )}
                {isRecording && (
                  <button onClick={handleStopRecording} style={{ fontSize: 20, padding: '0.7em 1.5em', background: 'red', color: 'white', border: 'none', borderRadius: 8 }}>Stop Recording</button>
                )}
                {recordedBlob && (
                  <>
                    <button onClick={handleUploadRecording} style={{ fontSize: 20, padding: '0.7em 1.5em', background: '#388e3c', color: 'white', border: 'none', borderRadius: 8 }}>Upload Recording</button>
                    <button onClick={() => { setRecordedBlob(null); setActionMsg('Recording discarded.'); }} style={{ fontSize: 20, padding: '0.7em 1.5em', background: '#eee', color: '#222', border: '1px solid #ccc', borderRadius: 8 }}>Discard</button>
                  </>
                )}
              </div>
              {recordedBlob && (
                <div style={{ marginTop: 16 }}>
                  <video src={URL.createObjectURL(recordedBlob)} controls style={{ maxWidth: 320, borderRadius: 8 }} />
                  <div style={{ color: '#888', fontSize: 14 }}>Preview before upload</div>
                </div>
              )}
              {actionMsg && <div style={{ marginTop: 16, color: '#333', fontWeight: 'bold' }}>{actionMsg}</div>}
              <div style={{ marginTop: 40, width: 400, maxWidth: '90%' }}>
                <h3>{t.aiChatbot}</h3>
                <div style={{ background: '#fff', minHeight: 100, borderRadius: 8, padding: 16, marginBottom: 8, boxShadow: '0 2px 8px #0001' }}>
                  {chatHistory.length === 0 && <div style={{ color: '#888' }}>{t.saySomething}</div>}
                  {chatHistory.map((msg, idx) => (
                    <div key={idx} style={{ textAlign: msg.from === 'user' ? 'right' : 'left', margin: '8px 0' }}>
                      <b>{msg.from === 'user' ? t.user : t.bot}:</b> {msg.text}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex' }}>
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendChat()}
                    placeholder={t.typeMessage}
                    style={{ flex: 1, fontSize: 18, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
                  />
                  <button onClick={sendChat} style={{ marginLeft: 8, fontSize: 18, padding: '8px 16px' }}>{t.send}</button>
                  <button onClick={handleMic} style={{ marginLeft: 8, fontSize: 18, padding: '8px 12px', background: micActive ? '#ffd700' : '#eee', borderRadius: 4, border: '1px solid #ccc' }} title={t.speak}>
                    {micActive ? '🎤' : '🎙️'}
                  </button>
                </div>
              </div>
              {/* Hospital Finder Section */}
              <div style={{ marginTop: 48 }}>
                {/* Radius Filter */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>Search Radius:</span>
                    <input
                      type="range"
                      min="1"
                      max="15"
                      value={radius}
                      onChange={e => { setRadius(Number(e.target.value)); window.selectedRadius = Number(e.target.value); }}
                      style={{ width: 200 }}
                    />
                    <span>{radius} km</span>
                  </label>
                </div>
                {/* Hospital Status Legend */}
                <div style={{ marginBottom: 16, padding: 12, background: '#f8f9fa', borderRadius: 8, border: '1px solid #dee2e6', display: 'inline-block' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: 8 }}>Hospital Status:</div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 14 }}>
                    <span>🟢 <b>Open</b> - Currently accepting patients</span>
                    <span>🟡 <b>24/7</b> - Open 24 hours, 7 days a week</span>
                    <span>🔴 <b>Closed</b> - Currently not accepting patients</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginTop: 24 }}>
                  <div style={{ flex: 1, minWidth: 350, maxWidth: 600, height: 350, borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px #0001', background: '#fff', position: 'relative' }}>
                    {/* Map for seniors */}
                    <SeniorMap userLocation={userLocation} hospitals={filteredHospitals} />
                  </div>
                  <div style={{ flex: 1, minWidth: 300 }}>
                    <h3>Nearby Hospitals ({filteredHospitals.length})</h3>
                    <ul style={{ padding: 0, listStyle: 'none' }}>
                      {filteredHospitals.map((h, i) => {
                        const distance = userLocation ? calculateDistance(userLocation.lat, userLocation.lng, h.lat, h.lng) : null;
                        return (
                          <li key={i} style={{ margin: '16px 0', padding: 16, background: '#f8fafc', borderRadius: 8, boxShadow: '0 1px 4px #0001', display: 'flex', alignItems: 'center', gap: 12 }}>
                            <button
                              onClick={() => navigateToHospital(h)}
                              style={{ fontSize: 28, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                              title="Get directions"
                            >
                              {h.is247 ? '🟡' : h.status === 'open' ? '🟢' : '🔴'}
                            </button>
                            <div style={{ flex: 1 }}>
                              <b>{h.name}</b><br />
                              <span>Status: {h.is247 ? '24/7' : h.status === 'open' ? 'Open' : 'Closed'}</span><br />
                              <span>Contact: {h.contact}</span>
                              {distance && <br />}
                              {distance && <span style={{ color: '#1976d2' }}>Distance: {distance.toFixed(1)} km</span>}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                    {filteredHospitals.length === 0 && (
                      <div style={{ color: '#666', textAlign: 'center', marginTop: 20 }}>
                        No hospitals found within {radius} km radius.
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Always visible Back button */}
              <div style={{ marginTop: 30, textAlign: 'center' }}>
                <button onClick={() => setRole(null)} style={{ fontSize: 20, padding: '0.5em 2em', background: '#eee', color: '#222', border: '1px solid #ccc', borderRadius: 8 }}>{t.back}</button>
              </div>
            </>
          ) : role === 'woman' || role === 'child' ? (
            <>
              <h2>{t.emergencyDashboard} ({roles.find(r => r.value === role).label})</h2>
              {/* Contacts Section */}
              <div style={{ marginBottom: 24 }}>
                <h3>Contacts</h3>
                <ul style={{ padding: 0, listStyle: 'none' }}>
                  {contacts.map((c, i) => (
                    <li key={i} style={{ margin: '12px 0', padding: 12, background: '#f8fafc', borderRadius: 8, boxShadow: '0 1px 4px #0001', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontWeight: 600 }}>{c.name}</span>
                      <span style={{ color: '#555' }}>{c.phone}</span>
                      <button onClick={() => handleCallContact(c.phone)} style={{ marginLeft: 'auto', fontSize: 16, padding: '4px 12px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6 }}>Call</button>
                    </li>
                  ))}
                </ul>
                <form onSubmit={e => { e.preventDefault(); if (newContact.name && newContact.phone) { setContacts([...contacts, newContact]); setNewContact({ name: '', phone: '' }); }}} style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                  <input type="text" placeholder="Name" value={newContact.name} onChange={e => setNewContact({ ...newContact, name: e.target.value })} style={{ flex: 1, fontSize: 16, padding: 6, borderRadius: 4, border: '1px solid #ccc' }} />
                  <input type="text" placeholder="Phone" value={newContact.phone} onChange={e => setNewContact({ ...newContact, phone: e.target.value })} style={{ flex: 1, fontSize: 16, padding: 6, borderRadius: 4, border: '1px solid #ccc' }} />
                  <button type="submit" style={{ fontSize: 16, padding: '6px 16px', background: '#388e3c', color: '#fff', border: 'none', borderRadius: 6 }}>Add</button>
                </form>
              </div>
              <button style={{ fontSize: 32, padding: '1em 2em', background: 'red', color: 'white', border: 'none', borderRadius: 8 }} onClick={handleEmergency}>{t.emergency}</button>
              {geoError && <div style={{ color: 'red', marginTop: 10 }}>{geoError}</div>}
              {emergencySent && <div style={{ color: 'green', marginTop: 20 }}>{t.emergency} triggered!</div>}
              {recordingUrl && (
                <div style={{ marginTop: 20 }}>
                  <a href={recordingUrl} download="emergency_recording.webm">Download Emergency Recording</a>
                </div>
              )}
              {uploadedUrl && (
                <div style={{ marginTop: 20 }}>
                  <a href={uploadedUrl} target="_blank" rel="noopener noreferrer">View Uploaded Emergency Recording</a>
                </div>
              )}
              {/* Action Switches */}
              <div style={{ marginTop: 30, display: 'flex', gap: 16 }}>
                <button onClick={handleCall} style={{ fontSize: 20, padding: '0.7em 1.5em', background: '#1976d2', color: 'white', border: 'none', borderRadius: 8 }}>{t.callContact}</button>
                <button onClick={handleSendLocation} style={{ fontSize: 20, padding: '0.7em 1.5em', background: '#388e3c', color: 'white', border: 'none', borderRadius: 8 }}>{t.sendLocation}</button>
                {!isRecording && !recordedBlob && (
                  <button onClick={handleRecord} style={{ fontSize: 20, padding: '0.7em 1.5em', background: '#fbc02d', color: 'black', border: 'none', borderRadius: 8 }}>{t.recordMedia}</button>
                )}
                {isRecording && (
                  <button onClick={handleStopRecording} style={{ fontSize: 20, padding: '0.7em 1.5em', background: 'red', color: 'white', border: 'none', borderRadius: 8 }}>Stop Recording</button>
                )}
                {recordedBlob && (
                  <>
                    <button onClick={handleUploadRecording} style={{ fontSize: 20, padding: '0.7em 1.5em', background: '#388e3c', color: 'white', border: 'none', borderRadius: 8 }}>Upload Recording</button>
                    <button onClick={() => { setRecordedBlob(null); setActionMsg('Recording discarded.'); }} style={{ fontSize: 20, padding: '0.7em 1.5em', background: '#eee', color: '#222', border: '1px solid #ccc', borderRadius: 8 }}>Discard</button>
                  </>
                )}
              </div>
              {recordedBlob && (
                <div style={{ marginTop: 16 }}>
                  <video src={URL.createObjectURL(recordedBlob)} controls style={{ maxWidth: 320, borderRadius: 8 }} />
                  <div style={{ color: '#888', fontSize: 14 }}>Preview before upload</div>
                </div>
              )}
              {actionMsg && <div style={{ marginTop: 16, color: '#333', fontWeight: 'bold' }}>{actionMsg}</div>}
              <div style={{ marginTop: 40, width: 400, maxWidth: '90%' }}>
                <h3>{t.aiChatbot}</h3>
                <div style={{ background: '#fff', minHeight: 100, borderRadius: 8, padding: 16, marginBottom: 8, boxShadow: '0 2px 8px #0001' }}>
                  {chatHistory.length === 0 && <div style={{ color: '#888' }}>{t.saySomething}</div>}
                  {chatHistory.map((msg, idx) => (
                    <div key={idx} style={{ textAlign: msg.from === 'user' ? 'right' : 'left', margin: '8px 0' }}>
                      <b>{msg.from === 'user' ? t.user : t.bot}:</b> {msg.text}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex' }}>
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendChat()}
                    placeholder={t.typeMessage}
                    style={{ flex: 1, fontSize: 18, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
                  />
                  <button onClick={sendChat} style={{ marginLeft: 8, fontSize: 18, padding: '8px 16px' }}>{t.send}</button>
                  <button onClick={handleMic} style={{ marginLeft: 8, fontSize: 18, padding: '8px 12px', background: micActive ? '#ffd700' : '#eee', borderRadius: 4, border: '1px solid #ccc' }} title={t.speak}>
                    {micActive ? '🎤' : '🎙️'}
                  </button>
                </div>
              </div>
              {/* Police Finder Section */}
              <div style={{ marginTop: 48 }}>
                <h3>Nearby Police Stations</h3>
                {/* Radius Filter */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>Search Radius:</span>
                    <input
                      type="range"
                      min="1"
                      max="15"
                      value={radius}
                      onChange={e => { setRadius(Number(e.target.value)); window.selectedRadius = Number(e.target.value); }}
                      style={{ width: 200 }}
                    />
                    <span>{radius} km</span>
                  </label>
                </div>
                {/* Police Status Legend */}
                <div style={{ marginBottom: 16, padding: 12, background: '#f8f9fa', borderRadius: 8, border: '1px solid #dee2e6', display: 'inline-block' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: 8 }}>Police Station Status:</div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 14 }}>
                    <span>🟢 <b>Open</b></span>
                    <span>🟡 <b>24/7</b></span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginTop: 24 }}>
                  <div style={{ flex: 1, minWidth: 350, maxWidth: 600, height: 350, borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px #0001', background: '#fff', position: 'relative' }}>
                    {/* Map for women/child */}
                    <PoliceMap userLocation={userLocation} stations={policeDemoData.filter(s => {
                      if (!userLocation) return true;
                      const distance = calculateDistance(userLocation.lat, userLocation.lng, s.lat, s.lng);
                      return distance <= radius;
                    })} />
                  </div>
                  <div style={{ flex: 1, minWidth: 300 }}>
                    <h4>Stations ({policeDemoData.filter(s => {
                      if (!userLocation) return true;
                      const distance = calculateDistance(userLocation.lat, userLocation.lng, s.lat, s.lng);
                      return distance <= radius;
                    }).length})</h4>
                    <ul style={{ padding: 0, listStyle: 'none' }}>
                      {policeDemoData.filter(s => {
                        if (!userLocation) return true;
                        const distance = calculateDistance(userLocation.lat, userLocation.lng, s.lat, s.lng);
                        return distance <= radius;
                      }).map((s, i) => {
                        const distance = userLocation ? calculateDistance(userLocation.lat, userLocation.lng, s.lat, s.lng) : null;
                        return (
                          <li key={i} style={{ margin: '16px 0', padding: 16, background: '#f8fafc', borderRadius: 8, boxShadow: '0 1px 4px #0001', display: 'flex', alignItems: 'center', gap: 12 }}>
                            <button
                              onClick={() => {
                                if (!userLocation) {
                                  alert('Please allow location access to get directions');
                                  return;
                                }
                                const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${s.lat},${s.lng}`;
                                window.open(url, '_blank');
                              }}
                              style={{ fontSize: 28, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                              title="Get directions"
                            >
                              {s.is247 ? '🟡' : '🟢'}
                            </button>
                            <div style={{ flex: 1 }}>
                              <b>{s.name}</b><br />
                              <span>{s.address}</span><br />
                              <span>Contact: {s.contact}</span>
                              {distance && <br />}
                              {distance && <span style={{ color: '#1976d2' }}>Distance: {distance.toFixed(1)} km</span>}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                    {policeDemoData.filter(s => {
                      if (!userLocation) return true;
                      const distance = calculateDistance(userLocation.lat, userLocation.lng, s.lat, s.lng);
                      return distance <= radius;
                    }).length === 0 && (
                      <div style={{ color: '#666', textAlign: 'center', marginTop: 20 }}>
                        No police stations found within {radius} km radius.
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Always visible Back button */}
              <div style={{ marginTop: 30, textAlign: 'center' }}>
                <button onClick={() => setRole(null)} style={{ fontSize: 20, padding: '0.5em 2em', background: '#eee', color: '#222', border: '1px solid #ccc', borderRadius: 8 }}>{t.back}</button>
              </div>
            </>
          ) : (
            <>
              <h2>{t.emergencyDashboard} ({roles.find(r => r.value === role).label})</h2>
              <button style={{ fontSize: 32, padding: '1em 2em', background: 'red', color: 'white', border: 'none', borderRadius: 8 }} onClick={handleEmergency}>{t.emergency}</button>
              {geoError && <div style={{ color: 'red', marginTop: 10 }}>{geoError}</div>}
              {emergencySent && <div style={{ color: 'green', marginTop: 20 }}>{t.emergency} triggered!</div>}
              {recordingUrl && (
                <div style={{ marginTop: 20 }}>
                  <a href={recordingUrl} download="emergency_recording.webm">Download Emergency Recording</a>
                </div>
              )}
              {uploadedUrl && (
                <div style={{ marginTop: 20 }}>
                  <a href={uploadedUrl} target="_blank" rel="noopener noreferrer">View Uploaded Emergency Recording</a>
                </div>
              )}
              {/* Action Switches */}
              <div style={{ marginTop: 30, display: 'flex', gap: 16 }}>
                <button onClick={handleCall} style={{ fontSize: 20, padding: '0.7em 1.5em', background: '#1976d2', color: 'white', border: 'none', borderRadius: 8 }}>{t.callContact}</button>
                <button onClick={handleSendLocation} style={{ fontSize: 20, padding: '0.7em 1.5em', background: '#388e3c', color: 'white', border: 'none', borderRadius: 8 }}>{t.sendLocation}</button>
                {!isRecording && !recordedBlob && (
                  <button onClick={handleRecord} style={{ fontSize: 20, padding: '0.7em 1.5em', background: '#fbc02d', color: 'black', border: 'none', borderRadius: 8 }}>{t.recordMedia}</button>
                )}
                {isRecording && (
                  <button onClick={handleStopRecording} style={{ fontSize: 20, padding: '0.7em 1.5em', background: 'red', color: 'white', border: 'none', borderRadius: 8 }}>Stop Recording</button>
                )}
                {recordedBlob && (
                  <>
                    <button onClick={handleUploadRecording} style={{ fontSize: 20, padding: '0.7em 1.5em', background: '#388e3c', color: 'white', border: 'none', borderRadius: 8 }}>Upload Recording</button>
                    <button onClick={() => { setRecordedBlob(null); setActionMsg('Recording discarded.'); }} style={{ fontSize: 20, padding: '0.7em 1.5em', background: '#eee', color: '#222', border: '1px solid #ccc', borderRadius: 8 }}>Discard</button>
                  </>
                )}
              </div>
              {recordedBlob && (
                <div style={{ marginTop: 16 }}>
                  <video src={URL.createObjectURL(recordedBlob)} controls style={{ maxWidth: 320, borderRadius: 8 }} />
                  <div style={{ color: '#888', fontSize: 14 }}>Preview before upload</div>
                </div>
              )}
              {actionMsg && <div style={{ marginTop: 16, color: '#333', fontWeight: 'bold' }}>{actionMsg}</div>}
              <div style={{ marginTop: 40, width: 400, maxWidth: '90%' }}>
                <h3>{t.aiChatbot}</h3>
                <div style={{ background: '#fff', minHeight: 100, borderRadius: 8, padding: 16, marginBottom: 8, boxShadow: '0 2px 8px #0001' }}>
                  {chatHistory.length === 0 && <div style={{ color: '#888' }}>{t.saySomething}</div>}
                  {chatHistory.map((msg, idx) => (
                    <div key={idx} style={{ textAlign: msg.from === 'user' ? 'right' : 'left', margin: '8px 0' }}>
                      <b>{msg.from === 'user' ? t.user : t.bot}:</b> {msg.text}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex' }}>
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendChat()}
                    placeholder={t.typeMessage}
                    style={{ flex: 1, fontSize: 18, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
                  />
                  <button onClick={sendChat} style={{ marginLeft: 8, fontSize: 18, padding: '8px 16px' }}>{t.send}</button>
                  <button onClick={handleMic} style={{ marginLeft: 8, fontSize: 18, padding: '8px 12px', background: micActive ? '#ffd700' : '#eee', borderRadius: 4, border: '1px solid #ccc' }} title={t.speak}>
                    {micActive ? '🎤' : '🎙️'}
                  </button>
                </div>
              </div>
              {/* Police Finder Section */}
              <div style={{ marginTop: 48 }}>
                <h3>Nearby Police Stations</h3>
                {/* Radius Filter */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>Search Radius:</span>
                    <input
                      type="range"
                      min="1"
                      max="15"
                      value={radius}
                      onChange={e => { setRadius(Number(e.target.value)); window.selectedRadius = Number(e.target.value); }}
                      style={{ width: 200 }}
                    />
                    <span>{radius} km</span>
                  </label>
                </div>
                {/* Police Status Legend */}
                <div style={{ marginBottom: 16, padding: 12, background: '#f8f9fa', borderRadius: 8, border: '1px solid #dee2e6', display: 'inline-block' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: 8 }}>Police Station Status:</div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 14 }}>
                    <span>🟢 <b>Open</b></span>
                    <span>🟡 <b>24/7</b></span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginTop: 24 }}>
                  <div style={{ flex: 1, minWidth: 350, maxWidth: 600, height: 350, borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px #0001', background: '#fff', position: 'relative' }}>
                    {/* Map for women/child */}
                    <PoliceMap userLocation={userLocation} stations={policeDemoData.filter(s => {
                      if (!userLocation) return true;
                      const distance = calculateDistance(userLocation.lat, userLocation.lng, s.lat, s.lng);
                      return distance <= radius;
                    })} />
                  </div>
                  <div style={{ flex: 1, minWidth: 300 }}>
                    <h4>Stations ({policeDemoData.filter(s => {
                      if (!userLocation) return true;
                      const distance = calculateDistance(userLocation.lat, userLocation.lng, s.lat, s.lng);
                      return distance <= radius;
                    }).length})</h4>
                    <ul style={{ padding: 0, listStyle: 'none' }}>
                      {policeDemoData.filter(s => {
                        if (!userLocation) return true;
                        const distance = calculateDistance(userLocation.lat, userLocation.lng, s.lat, s.lng);
                        return distance <= radius;
                      }).map((s, i) => {
                        const distance = userLocation ? calculateDistance(userLocation.lat, userLocation.lng, s.lat, s.lng) : null;
                        return (
                          <li key={i} style={{ margin: '16px 0', padding: 16, background: '#f8fafc', borderRadius: 8, boxShadow: '0 1px 4px #0001', display: 'flex', alignItems: 'center', gap: 12 }}>
                            <button
                              onClick={() => {
                                if (!userLocation) {
                                  alert('Please allow location access to get directions');
                                  return;
                                }
                                const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${s.lat},${s.lng}`;
                                window.open(url, '_blank');
                              }}
                              style={{ fontSize: 28, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                              title="Get directions"
                            >
                              {s.is247 ? '🟡' : '🟢'}
                            </button>
                            <div style={{ flex: 1 }}>
                              <b>{s.name}</b><br />
                              <span>{s.address}</span><br />
                              <span>Contact: {s.contact}</span>
                              {distance && <br />}
                              {distance && <span style={{ color: '#1976d2' }}>Distance: {distance.toFixed(1)} km</span>}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                    {policeDemoData.filter(s => {
                      if (!userLocation) return true;
                      const distance = calculateDistance(userLocation.lat, userLocation.lng, s.lat, s.lng);
                      return distance <= radius;
                    }).length === 0 && (
                      <div style={{ color: '#666', textAlign: 'center', marginTop: 20 }}>
                        No police stations found within {radius} km radius.
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Always visible Back button */}
              <div style={{ marginTop: 30, textAlign: 'center' }}>
                <button onClick={() => setRole(null)} style={{ fontSize: 20, padding: '0.5em 2em', background: '#eee', color: '#222', border: '1px solid #ccc', borderRadius: 8 }}>{t.back}</button>
              </div>
            </>
          )}
        </div>
      )}
      <button
        className="fab-emergency"
        style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}
        onClick={() => setShowMobileChat(true)}
        title="Open Emergency Chatbot"
      >
        🤖
      </button>
      <MobileChatbotModal
        open={showMobileChat}
        onClose={() => setShowMobileChat(false)}
        chatHistory={chatHistory}
        chatInput={chatInput}
        setChatInput={setChatInput}
        sendChat={sendChat}
        handleMic={handleMic}
        micActive={micActive}
        quickReplies={quickReplies}
        onQuickReply={handleQuickReply}
        userLocation={userLocation}
      />
    </div>
  );
} 