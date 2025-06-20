import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

let socket;

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const ROLES = [
  { label: 'Woman', value: 'woman' },
  { label: 'Child', value: 'child' },
  { label: 'Senior', value: 'senior' },
  { label: 'Layman', value: 'layman' },
];
const HOSPITALS = [
  { name: 'City Hospital', eta: '10 min', contact: '+91-1234567890' },
  { name: 'General Hospital', eta: '12 min', contact: '+91-9876543210' },
  { name: 'Apollo Clinic', eta: '15 min', contact: '+91-1122334455' },
];

export default function GuardianDashboard() {
  const [alerts, setAlerts] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState(ROLES.map(r => r.value));
  const [selectedAlert, setSelectedAlert] = useState(null);
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    // Fetch initial emergencies
    fetch('/api/emergencies')
      .then(res => res.json())
      .then(data => setAlerts(data));

    // Connect to socket
    socket = io('http://localhost:5000');
    socket.on('emergency', (event) => {
      setAlerts((prev) => {
        // Replace if already exists, else add to front
        const idx = prev.findIndex(e => e.id === event.id);
        if (idx !== -1) {
          const updated = [...prev];
          updated[idx] = event;
          return updated;
        }
        return [event, ...prev];
      });
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  // Load Google Maps script
  useEffect(() => {
    if (!window.google && GOOGLE_MAPS_API_KEY) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
      script.async = true;
      script.onload = () => initMap();
      document.body.appendChild(script);
    } else if (window.google) {
      initMap();
    }
    // eslint-disable-next-line
  }, []);

  // Initialize map
  const initMap = () => {
    if (mapRef.current && !map) {
      const m = new window.google.maps.Map(mapRef.current, {
        center: { lat: 20.5937, lng: 78.9629 }, // Center of India
        zoom: 5,
      });
      setMap(m);
    }
  };

  // Add markers for alerts
  useEffect(() => {
    if (map && alerts.length > 0) {
      // Remove old markers
      markers.forEach(marker => marker.setMap(null));
      const newMarkers = alerts
        .filter(alert => selectedRoles.includes(alert.role))
        .map((alert, idx) => {
          if (alert.location) {
            const marker = new window.google.maps.Marker({
              position: { lat: alert.location.lat, lng: alert.location.lng },
              map,
              title: `${alert.role} emergency`,
            });
            marker.addListener('click', () => setSelectedAlert({ ...alert, idx }));
            return marker;
          }
          return null;
        })
        .filter(Boolean);
      setMarkers(newMarkers);
      if (alerts[0].location) {
        map.setCenter({ lat: alerts[0].location.lat, lng: alerts[0].location.lng });
        map.setZoom(13);
      }
    }
    // eslint-disable-next-line
  }, [alerts, map, selectedRoles]);

  const filteredAlerts = alerts.filter(alert => selectedRoles.includes(alert.role));

  return (
    <div style={{ minHeight: '100vh', padding: 40, background: '#f0f4f8' }}>
      <h1>Guardian Dashboard</h1>
      <h2>Real-Time Emergency Alerts</h2>
      {/* Filter Controls */}
      <div style={{ marginBottom: 16 }}>
        <b>Filter by Role:</b>
        {ROLES.map(r => (
          <label key={r.value} style={{ marginLeft: 12, fontWeight: 400 }}>
            <input
              type="checkbox"
              checked={selectedRoles.includes(r.value)}
              onChange={e => {
                if (e.target.checked) setSelectedRoles([...selectedRoles, r.value]);
                else setSelectedRoles(selectedRoles.filter(val => val !== r.value));
              }}
            />{' '}{r.label}
          </label>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 350, maxWidth: 600, height: 400, borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px #0001', background: '#fff', position: 'relative' }}>
          <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
          {/* Alert Details Modal */}
          {selectedAlert && (
            <div style={{ position: 'absolute', top: 30, left: 30, right: 30, background: '#fff', borderRadius: 8, boxShadow: '0 2px 16px #0003', padding: 24, zIndex: 20 }}>
              <button onClick={() => setSelectedAlert(null)} style={{ position: 'absolute', top: 8, right: 8, fontSize: 18 }}>✕</button>
              <h3>Alert Details</h3>
              <b>Role:</b> {selectedAlert.role}<br />
              <b>Location:</b> {selectedAlert.location ? `${selectedAlert.location.lat}, ${selectedAlert.location.lng}` : 'N/A'}<br />
              <b>Time:</b> {new Date(selectedAlert.timestamp).toLocaleString()}<br />
              <b>Contact:</b> +91-9876543210<br />
              <b>User Name:</b> Demo User<br />
              {selectedAlert.mediaUrl && (
                <div style={{ marginTop: 10 }}>
                  <a href={selectedAlert.mediaUrl} target="_blank" rel="noopener noreferrer">View Emergency Recording</a>
                </div>
              )}
              <div style={{ marginTop: 16 }}>
                <b>Nearby Hospitals:</b>
                <ul>
                  {HOSPITALS.map((h, i) => (
                    <li key={i}>{h.name} — {h.eta} — {h.contact}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 300 }}>
          {filteredAlerts.length === 0 && <div>No alerts yet.</div>}
          <ul style={{ padding: 0, listStyle: 'none' }}>
            {filteredAlerts.map((alert, idx) => (
              <li key={idx} style={{ margin: '20px 0', padding: 20, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 10 }} onClick={() => setSelectedAlert({ ...alert, idx })}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 22 }}>{alert.role ? alert.role.charAt(0).toUpperCase() + alert.role.slice(1) : 'User'}</span>
                  <span style={{ color: '#1976d2', fontWeight: 600 }}>{alert.status || 'ACTIVE'}</span>
                  <span style={{ marginLeft: 'auto', color: '#888', fontSize: 13 }}>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                </div>
                <div style={{ fontSize: 15, color: '#333', margin: '6px 0' }}>{alert.description}</div>
                <div style={{ fontSize: 14, color: '#555' }}>
                  <b>Location:</b> {alert.location ? `${alert.location.lat.toFixed(4)}, ${alert.location.lng.toFixed(4)}` : 'N/A'}
                  {alert.location && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${alert.location.lat},${alert.location.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ marginLeft: 10, color: '#1976d2', textDecoration: 'underline', fontWeight: 500 }}
                    >
                      Get Directions
                    </a>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
                  <button style={{ fontSize: 16, padding: '8px 18px', background: '#388e3c', color: '#fff', border: 'none', borderRadius: 8 }} onClick={e => { e.stopPropagation(); window.open('tel:+919876543210'); }}>Call</button>
                  {alert.mediaUrl && (
                    <button style={{ fontSize: 16, padding: '8px 18px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8 }} onClick={e => { e.stopPropagation(); window.open(alert.mediaUrl, '_blank'); }}>View Media</button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
} 