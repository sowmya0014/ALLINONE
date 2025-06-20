const fetch = require('node-fetch');

async function testChatbot() {
  console.log('🧪 Testing Chatbot API...\n');
  
  const testMessages = [
    'hello',
    'help me',
    'emergency',
    'call someone',
    'send location'
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
  
  console.log('✅ Chatbot test completed!');
}

// Run the test
testChatbot().catch(console.error); 