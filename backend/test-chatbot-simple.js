const fetch = require('node-fetch');

async function testChatbot() {
  console.log('🧪 Testing Simple Chatbot API...\n');
  
  const testMessages = [
    'hello',
    'help me',
    'emergency',
    'call someone',
    'send location',
    'how are you',
    'what can you do'
  ];
  
  for (const message of testMessages) {
    try {
      console.log(`📤 Sending: "${message}"`);
      
      const response = await fetch('http://localhost:5000/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`📥 Response: "${data.response}"`);
      console.log(`🎯 Intent: ${data.intent}`);
      console.log('---');
      
    } catch (error) {
      console.error(`❌ Error testing "${message}":`, error.message);
      console.log('---');
    }
  }
  
  console.log('✅ Simple chatbot test completed!');
}

// Test backend connection first
async function testBackend() {
  try {
    console.log('🔍 Testing backend connection...');
    const response = await fetch('http://localhost:5000/api/test');
    const data = await response.json();
    console.log('✅ Backend is running:', data.message);
    console.log('Emergency Engine:', data.emergencyEngine);
    console.log('---\n');
  } catch (error) {
    console.error('❌ Backend not running:', error.message);
    console.log('Please start the backend with: npm run dev');
    return;
  }
}

// Run tests
async function runTests() {
  await testBackend();
  await testChatbot();
}

runTests().catch(console.error); 