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

  const startRecording = async () => {
    setRecordingUrl(null);
    setUploadedUrl(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      mediaRecorderRef.current = new window.MediaRecorder(stream);
      recordedChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };
      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        setRecordingUrl(URL.createObjectURL(blob));
        // Upload to backend
        const formData = new FormData();
        formData.append('media', blob, 'emergency_recording.webm');
        try {
          const res = await fetch('http://localhost:4000/api/upload', {
            method: 'POST',
            body: formData,
          });
          const data = await res.json();
          if (data.url) {
            setUploadedUrl('http://localhost:4000' + data.url);
            setRecordingUrl(null); // Remove local download if uploaded
          }
        } catch (e) {
          // Ignore upload error for now
        }
      };
      mediaRecorderRef.current.start();
      // Stop after 30 seconds for MVP
      setTimeout(() => {
        mediaRecorderRef.current && mediaRecorderRef.current.stop();
        stream.getTracks().forEach(track => track.stop());
      }, 30000);
    } catch (err) {
      alert('Could not access camera/microphone: ' + err.message);
    }
  };

  const handleEmergency = async () => {
    setEmergencySent(false);
    setGeoError('');
    setEmergencyId(null);
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(async (position) => {
      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      // Send emergency trigger (mediaUrl if already uploaded)
      const res = await fetch('http://localhost:4000/api/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, location, mediaUrl: uploadedUrl }),
      });
      const data = await res.json();
      if (res.ok) {
        setEmergencySent(true);
        setEmergencyId(data.id);
      }
      // Start background recording
      startRecording();
    }, (err) => {
      setGeoError('Could not get location: ' + err.message);
    });
  };

  // After upload, PATCH emergency event with mediaUrl if needed
  useEffect(() => {
    if (uploadedUrl && emergencyId) {
      fetch(`http://localhost:4000/api/emergency/${emergencyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaUrl: uploadedUrl }),
      });
    }
  }, [uploadedUrl, emergencyId]);

  // Action handlers
  const handleCall = () => {
    setActionMsg('Calling your emergency contact... (simulated)');
    // TODO: Integrate Twilio or phone call logic
  };
  const handleSendLocation = () => {
    if (!navigator.geolocation) {
      setActionMsg('Geolocation not supported.');
      return;
    }
    navigator.geolocation.getCurrentPosition((position) => {
      setActionMsg(`Location sent: ${position.coords.latitude}, ${position.coords.longitude}`);
      // TODO: Send to backend/guardian
    }, (err) => {
      setActionMsg('Could not get location: ' + err.message);
    });
  };
  const handleRecord = () => {
    setActionMsg('Recording video/audio...');
    startRecording();
  };

  // Update sendChat to trigger actions based on intent
  const sendChat = async () => {
    if (!chatInput.trim()) return;
    setChatHistory((prev) => [...prev, { from: 'user', text: chatInput }]);
    const res = await fetch('http://localhost:4000/api/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: chatInput }),
    });
    const data = await res.json();
    setChatHistory((prev) => [...prev, { from: 'bot', text: data.response }]);
    setChatInput('');
    // Trigger actions based on intent
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
  };

  const handleMic = () => {
    if (!recognition) {
      alert('Speech recognition not supported in this browser.');
      return;
    }
    setListening(true);
    recognition.start();
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setChatInput(transcript);
      setListening(false);
    };
    recognition.onerror = () => {
      setListening(false);
    };
    recognition.onend = () => {
      setListening(false);
    };
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

  // Layman voice command handler
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
        // Voice command logic
        if (transcript.startsWith('call ')) {
          const name = transcript.replace('call ', '').trim();
          const contact = contacts.find(c => c.name.toLowerCase() === name);
          if (contact) {
            setLaymanMsg(`Calling ${contact.name} at ${contact.phone}... (simulated)`);
          } else {
            setLaymanMsg(`Contact '${name}' not found.`);
          }
        } else if (transcript.includes('youtube')) {
          setLaymanMsg('Opening YouTube...');
          window.open('https://www.youtube.com', '_blank');
        } else if (transcript.includes('good morning')) {
          setLaymanMsg('Good morning! How can I help you today?');
        } else {
          setLaymanMsg(`Sorry, I didn't understand: "${transcript}"`);
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
              <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginTop: 24 }}>
                <div style={{ flex: 1, minWidth: 300 }}>
                  <h3>Contacts</h3>
                  <ul style={{ padding: 0, listStyle: 'none' }}>
                    {contacts.map((c, i) => (
                      <li key={i} style={{ margin: '12px 0', padding: 12, background: '#f8fafc', borderRadius: 8, boxShadow: '0 1px 4px #0001', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontWeight: 600 }}>{c.name}</span>
                        <span style={{ color: '#555' }}>{c.phone}</span>
                        <button onClick={() => setLaymanMsg(`Calling ${c.name} at ${c.phone}... (simulated)`)} style={{ marginLeft: 'auto', fontSize: 16, padding: '4px 12px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6 }}>Call</button>
                      </li>
                    ))}
                  </ul>
                  <form onSubmit={e => { e.preventDefault(); if (newContact.name && newContact.phone) { setContacts([...contacts, newContact]); setNewContact({ name: '', phone: '' }); }}} style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                    <input type="text" placeholder="Name" value={newContact.name} onChange={e => setNewContact({ ...newContact, name: e.target.value })} style={{ flex: 1, fontSize: 16, padding: 6, borderRadius: 4, border: '1px solid #ccc' }} />
                    <input type="text" placeholder="Phone" value={newContact.phone} onChange={e => setNewContact({ ...newContact, phone: e.target.value })} style={{ flex: 1, fontSize: 16, padding: 6, borderRadius: 4, border: '1px solid #ccc' }} />
                    <button type="submit" style={{ fontSize: 16, padding: '6px 16px', background: '#388e3c', color: '#fff', border: 'none', borderRadius: 6 }}>Add</button>
                  </form>
                </div>
                <div style={{ flex: 1, minWidth: 300 }}>
                  <h3>Voice Assistant</h3>
                  <button onClick={handleLaymanVoice} style={{ fontSize: 18, padding: '10px 24px', background: laymanVoiceListening ? '#ffd700' : '#eee', borderRadius: 8, border: '1px solid #ccc', marginBottom: 12 }}>
                    {laymanVoiceListening ? '🎤 Listening...' : '🎤 Speak Command'}
                  </button>
                  <div style={{ minHeight: 40, color: '#1976d2', fontWeight: 600 }}>{laymanMsg}</div>
                  <div style={{ marginTop: 24 }}>
                    <b>Try saying:</b>
                    <ul>
                      <li>"Call Son"</li>
                      <li>"Open YouTube"</li>
                      <li>"Good morning"</li>
                    </ul>
                  </div>
                </div>
              </div>
              {/* Always visible Back button */}
              <div style={{ marginTop: 30, textAlign: 'center' }}>
                <button onClick={() => setRole(null)} style={{ fontSize: 20, padding: '0.5em 2em', background: '#eee', color: '#222', border: '1px solid #ccc', borderRadius: 8 }}>{t.back}</button>
              </div>
            </div>
          ) : role === 'senior' ? (
            <div>
              <h2>{t.emergencyDashboard} ({roles.find(r => r.value === role).label})</h2>
              {/* Radius Filter */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>Search Radius:</span>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    value={radius}
                    onChange={e => setRadius(Number(e.target.value))}
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
              {/* Always visible Back button */}
              <div style={{ marginTop: 30, textAlign: 'center' }}>
                <button onClick={() => setRole(null)} style={{ fontSize: 20, padding: '0.5em 2em', background: '#eee', color: '#222', border: '1px solid #ccc', borderRadius: 8 }}>{t.back}</button>
              </div>
            </div>
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
                <button onClick={handleRecord} style={{ fontSize: 20, padding: '0.7em 1.5em', background: '#fbc02d', color: 'black', border: 'none', borderRadius: 8 }}>{t.recordMedia}</button>
              </div>
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
                  <button onClick={handleMic} style={{ marginLeft: 8, fontSize: 18, padding: '8px 12px', background: listening ? '#ffd700' : '#eee', borderRadius: 4, border: '1px solid #ccc' }} title={t.speak}>
                    {listening ? '🎤...' : '🎤'}
                  </button>
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
    </div>
  );
} 