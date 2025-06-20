import { useState, createContext, useContext } from 'react';
import '../styles/globals.css';

export const AccessibilityContext = createContext();
export const LanguageContext = createContext();

const translations = {
  en: {
    selectRole: 'Select Your Role',
    emergencyDashboard: 'Emergency Dashboard',
    emergency: 'EMERGENCY',
    callContact: 'Call Contact',
    sendLocation: 'Send Location',
    recordMedia: 'Record Video/Audio',
    aiChatbot: 'AI Chatbot',
    typeMessage: 'Type your message...',
    send: 'Send',
    speak: 'Speak',
    back: 'Back',
    alerts: 'Real-Time Emergency Alerts',
    guardianDashboard: 'Guardian Dashboard',
    noAlerts: 'No alerts yet.',
    user: 'You',
    bot: 'Bot',
    saySomething: 'Say something like "Call my son" or "Send my location"...'
  },
  hi: {
    selectRole: 'अपनी भूमिका चुनें',
    emergencyDashboard: 'आपातकालीन डैशबोर्ड',
    emergency: 'आपातकाल',
    callContact: 'संपर्क करें',
    sendLocation: 'स्थान भेजें',
    recordMedia: 'वीडियो/ऑडियो रिकॉर्ड करें',
    aiChatbot: 'एआई चैटबोट',
    typeMessage: 'अपना संदेश लिखें...',
    send: 'भेजें',
    speak: 'बोलें',
    back: 'वापस',
    alerts: 'रीयल-टाइम आपातकालीन अलर्ट',
    guardianDashboard: 'अभिभावक डैशबोर्ड',
    noAlerts: 'अभी तक कोई अलर्ट नहीं।',
    user: 'आप',
    bot: 'बॉट',
    saySomething: '"मेरे बेटे को कॉल करें" या "मेरा स्थान भेजें" जैसे कुछ कहें...'
  },
  te: {
    selectRole: 'మీ పాత్రను ఎంచుకోండి',
    emergencyDashboard: 'అత్యవసర డాష్‌బోర్డ్',
    emergency: 'అత్యవసరం',
    callContact: 'సంప్రదించండి',
    sendLocation: 'స్థానాన్ని పంపండి',
    recordMedia: 'వీడియో/ఆడియో రికార్డ్ చేయండి',
    aiChatbot: 'ఏఐ చాట్‌బాట్',
    typeMessage: 'మీ సందేశాన్ని టైప్ చేయండి...',
    send: 'పంపండి',
    speak: 'మాట్లాడండి',
    back: 'వెనక్కి',
    alerts: 'రియల్-టైమ్ అత్యవసర హెచ్చరికలు',
    guardianDashboard: 'గార్డియన్ డాష్‌బోర్డ్',
    noAlerts: 'ఇంకా హెచ్చరికలు లేవు.',
    user: 'మీరు',
    bot: 'బాట్',
    saySomething: '"నా కుమారుడికి కాల్ చేయండి" లేదా "నా స్థానాన్ని పంపండి" అని చెప్పండి...'
  }
};

export function useAccessibility() {
  return useContext(AccessibilityContext);
}
export function useLanguage() {
  return useContext(LanguageContext);
}

function MyApp({ Component, pageProps }) {
  const [textSize, setTextSize] = useState(1);
  const [highContrast, setHighContrast] = useState(false);
  const [nightMode, setNightMode] = useState(false);
  const [lang, setLang] = useState('en');
  const t = translations[lang];

  // Pronounced color difference for light/dark mode
  const bgColor = nightMode ? '#181a1b' : highContrast ? '#000' : '#fff';
  const textColor = nightMode ? '#f5f6fa' : highContrast ? '#fff' : '#222';

  return (
    <AccessibilityContext.Provider value={{ textSize, setTextSize, highContrast, setHighContrast, nightMode, setNightMode }}>
      <LanguageContext.Provider value={{ lang, setLang, t }}>
        <div style={{
          fontSize: `${textSize}em`,
          background: bgColor,
          color: textColor,
          minHeight: '100vh',
          transition: 'all 0.2s',
        }}>
          <Component {...pageProps} />
        </div>
      </LanguageContext.Provider>
    </AccessibilityContext.Provider>
  );
}

export default MyApp; 