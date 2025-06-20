import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import io from 'socket.io-client';
import styles from '../styles/EmergencyDashboard.module.css';

let socket;

export default function EmergencyDashboard() {
  const router = useRouter();
  const { role } = router.query;
  
  const [emergencyDescription, setEmergencyDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [emergencies, setEmergencies] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaFile, setMediaFile] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    socketInitializer();
    
    // Get user location
    getUserLocation();
    
    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  const socketInitializer = async () => {
    await fetch('/api/socket');
    socket = io('http://localhost:5000');

    socket.on('connect', () => {
      console.log('Connected to emergency system');
      socket.emit('joinEmergencyRoom');
    });

    socket.on('emergencyAnalysis', (data) => {
      console.log('Received emergency analysis:', data);
      setAnalysis(data.data);
      setIsAnalyzing(false);
    });

    socket.on('newEmergency', (data) => {
      console.log('New emergency:', data);
      setEmergencies(prev => [data.data, ...prev]);
    });

    socket.on('emergencyNotification', (data) => {
      console.log('Emergency notification:', data);
      // Show notification
      showNotification(data);
    });
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Location error:', error);
        }
      );
    }
  };

  const showNotification = (data) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Emergency Alert', {
        body: data.message,
        icon: '/emergency-icon.png'
      });
    }
  };

  const analyzeEmergency = async () => {
    if (!emergencyDescription.trim()) {
      alert('Please describe the emergency');
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const response = await fetch('/api/emergency/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: emergencyDescription,
          location: userLocation,
          userRole: role,
          audio: null, // Will be added later
          image: null  // Will be added later
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setAnalysis(result.analysis);
      } else {
        alert('Analysis failed: ' + result.error);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Failed to analyze emergency');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const submitEmergency = async () => {
    if (!analysis) {
      alert('Please analyze the emergency first');
      return;
    }

    try {
      const response = await fetch('/api/emergency', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: emergencyDescription,
          location: userLocation,
          userRole: role,
          emergencyType: analysis.category,
          contactInfo: {
            name: 'User',
            phone: 'Emergency Contact'
          }
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Emergency submitted successfully! Help is on the way.');
        setEmergencyDescription('');
        setAnalysis(null);
      } else {
        alert('Failed to submit emergency: ' + result.error);
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to submit emergency');
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    // Voice recording logic will be implemented here
  };

  const stopRecording = () => {
    setIsRecording(false);
    // Stop recording logic
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setMediaFile(file);
    }
  };

  const uploadMedia = async () => {
    if (!mediaFile) return;

    const formData = new FormData();
    formData.append('file', mediaFile);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Media uploaded successfully');
        setMediaFile(null);
        setUploadedUrl(result.url);
      } else {
        alert('Upload failed: ' + result.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload media');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'IMMEDIATE': return '#ff0000';
      case 'URGENT': return '#ff6600';
      case 'NORMAL': return '#ffcc00';
      case 'LOW': return '#00cc00';
      default: return '#666666';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'MEDICAL': return '🏥';
      case 'FIRE': return '🔥';
      case 'SECURITY': return '🚨';
      case 'ACCIDENT': return '🚗';
      case 'NATURAL_DISASTER': return '🌪️';
      default: return '⚠️';
    }
  };

  const handleEmergency = () => {
    // Implementation of handleEmergency function
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🚨 Emergency Dashboard</h1>
        <p>Role: {role || 'User'}</p>
        {userLocation && (
          <p>📍 Location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</p>
        )}
      </div>

      <div className={styles.mainContent + ' mobile-padding'}>
        {/* Emergency Description Input */}
        <div className={styles.inputSection}>
          <h2>Describe the Emergency</h2>
          <textarea
            value={emergencyDescription}
            onChange={(e) => setEmergencyDescription(e.target.value)}
            placeholder="Describe what happened... (e.g., 'Someone is having chest pain and difficulty breathing')"
            className={styles.emergencyInput}
            rows={4}
          />
          
          <div className={styles.actionButtons}>
            <button 
              onClick={analyzeEmergency}
              disabled={isAnalyzing || !emergencyDescription.trim()}
              className={styles.analyzeButton}
            >
              {isAnalyzing ? '🔍 Analyzing...' : '🤖 AI Analysis'}
            </button>
            
            <button 
              onClick={isRecording ? stopRecording : startRecording}
              className={`${styles.recordButton} ${isRecording ? styles.recording : ''}`}
            >
              {isRecording ? '⏹️ Stop Recording' : '🎤 Voice Record'}
            </button>
          </div>
        </div>

        {/* AI Analysis Results */}
        {analysis && (
          <div className={styles.analysisSection}>
            <h2>🤖 AI Analysis Results</h2>
            <div className={styles.analysisCard}>
              <div className={styles.analysisHeader}>
                <span className={styles.categoryIcon}>
                  {getCategoryIcon(analysis.category)}
                </span>
                <div>
                  <h3>{(analysis && analysis.category ? analysis.category.replace('_', ' ') : 'Unknown')} Emergency</h3>
                  <span 
                    className={styles.priority}
                    style={{ backgroundColor: getPriorityColor(analysis.priority) }}
                  >
                    {analysis.priority} Priority
                  </span>
                </div>
              </div>
              
              <div className={styles.analysisDetails}>
                <div className={styles.detailItem}>
                  <strong>Severity:</strong> {analysis.severity}
                </div>
                <div className={styles.detailItem}>
                  <strong>Response Time:</strong> {analysis.estimatedResponseTime}
                </div>
                <div className={styles.detailItem}>
                  <strong>Services:</strong> {(analysis && Array.isArray(analysis.recommendedServices) ? analysis.recommendedServices.join(', ') : 'N/A')}
                </div>
                <div className={styles.detailItem}>
                  {/* <strong>Confidence:</strong> {(analysis.confidence * 100).toFixed(1)}% */}
                </div>
              </div>

              <div className={styles.actionItems}>
                <h4>Recommended Actions:</h4>
                <ul>
                  {(analysis && Array.isArray(analysis.actionItems)) ? (
                    analysis.actionItems.map((action, index) => (
                      <li key={index}>{action}</li>
                    ))
                  ) : (
                    <li>N/A</li>
                  )}
                </ul>
              </div>

              <button 
                onClick={submitEmergency}
                className={styles.submitButton}
              >
                🚨 Submit Emergency
              </button>
            </div>
          </div>
        )}

        {/* Media Upload */}
        <div className={styles.mediaSection}>
          <h2>📷 Add Media (Optional)</h2>
          <input
            type="file"
            accept="image/*,video/*,audio/*"
            onChange={handleFileUpload}
            className={styles.fileInput}
            capture="environment"
          />
          {mediaFile && (
            <div className={styles.fileInfo}>
              <p>Selected: {mediaFile.name}</p>
              <button onClick={uploadMedia} className={styles.uploadButton}>
                📤 Upload Media
              </button>
            </div>
          )}
          {/* Media preview */}
          {uploadedUrl && (
            <div style={{ marginTop: 12 }}>
              {uploadedUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                <img src={uploadedUrl} alt="Uploaded" style={{ maxWidth: '100%', borderRadius: 8 }} />
              ) : uploadedUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                <video src={uploadedUrl} controls style={{ maxWidth: '100%', borderRadius: 8 }} />
              ) : uploadedUrl.match(/\.(mp3|wav|m4a)$/i) ? (
                <audio src={uploadedUrl} controls style={{ width: '100%' }} />
              ) : (
                <a href={uploadedUrl} target="_blank" rel="noopener noreferrer">View Uploaded Media</a>
              )}
            </div>
          )}
        </div>

        {/* Recent Emergencies */}
        <div className={styles.recentEmergencies}>
          <h2>📋 Recent Emergencies</h2>
          {emergencies.length === 0 ? (
            <p>No recent emergencies</p>
          ) : (
            <div className={styles.emergencyList}>
              {emergencies.slice(0, 5).map((emergency, index) => (
                <div key={index} className={styles.emergencyItem}>
                  <div className={styles.emergencyHeader}>
                    <span>{getCategoryIcon(emergency.aiAnalysis?.category)}</span>
                    <span className={styles.emergencyTime}>
                      {new Date(emergency.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p>{emergency.description}</p>
                  <span 
                    className={styles.emergencyPriority}
                    style={{ backgroundColor: getPriorityColor(emergency.priority) }}
                  >
                    {emergency.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Emergency Button for mobile */}
      <button className={styles['fab-emergency']} onClick={handleEmergency} title="Trigger Emergency">
        🚨
      </button>

      <div className={styles.footer}>
        <button onClick={() => router.push('/')} className={styles.backButton}>
          ← Back to Home
        </button>
      </div>
    </div>
  );
} 