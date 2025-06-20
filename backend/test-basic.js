const fetch = require('node-fetch');

async function testBasicChatbot() {
  console.log('🧪 Testing Basic Chatbot...\n');
  
  try {
    // Test 1: Simple hello message
    console.log('📤 Testing: "hello"');
    const response1 = await fetch('http://localhost:5000/api/chatbot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: 'hello' }),
    });
    
    console.log('Status:', response1.status);
    const data1 = await response1.json();
    console.log('Response:', data1);
    console.log('---');
    
    // Test 2: Emergency message
    console.log('📤 Testing: "emergency"');
    const response2 = await fetch('http://localhost:5000/api/chatbot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: 'emergency' }),
    });
    
    console.log('Status:', response2.status);
    const data2 = await response2.json();
    console.log('Response:', data2);
    console.log('---');
    
    console.log('✅ Basic test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testBasicChatbot(); 