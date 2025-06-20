const fetch = require('node-fetch');

async function testAIAnalysis() {
  console.log('🤖 Testing AI-Powered Emergency Analysis...\n');
  
  const testEmergencies = [
    {
      description: "I'm having severe chest pain and difficulty breathing",
      userRole: "Senior",
      location: { lat: 17.3850, lng: 78.4867 }
    },
    {
      description: "There's a fire in my kitchen, smoke everywhere",
      userRole: "Women", 
      location: { lat: 17.3850, lng: 78.4867 }
    },
    {
      description: "Someone is trying to break into my house",
      userRole: "Women",
      location: { lat: 17.3850, lng: 78.4867 }
    },
    {
      description: "Car accident on the highway, multiple vehicles involved",
      userRole: "Layman",
      location: { lat: 17.3850, lng: 78.4867 }
    }
  ];
  
  for (const emergency of testEmergencies) {
    try {
      console.log(`🚨 Testing Emergency: "${emergency.description}"`);
      console.log(`👤 User Role: ${emergency.userRole}`);
      
      const response = await fetch('http://localhost:5000/api/emergency/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emergency),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const analysis = await response.json();
      
      console.log('📊 AI Analysis Results:');
      console.log(`   Category: ${analysis.analysis.category}`);
      console.log(`   Severity: ${analysis.analysis.severity}`);
      console.log(`   Priority: ${analysis.analysis.priority}`);
      console.log(`   Response Time: ${analysis.analysis.estimatedResponseTime}`);
      console.log(`   Confidence: ${analysis.analysis.confidence}`);
      console.log(`   Action Items: ${analysis.analysis.actionItems.join(', ')}`);
      console.log('---');
      
    } catch (error) {
      console.error(`❌ Error testing emergency:`, error.message);
      console.log('---');
    }
  }
  
  console.log('✅ AI Analysis test completed!');
}

// Test emergency creation with AI
async function testEmergencyCreation() {
  console.log('\n🚨 Testing Emergency Creation with AI...\n');
  
  try {
    const emergencyData = {
      description: "Severe headache and dizziness, feeling very weak",
      userRole: "Senior",
      location: { lat: 17.3850, lng: 78.4867 },
      emergencyType: "medical"
    };
    
    console.log('📤 Creating emergency with AI analysis...');
    
    const response = await fetch('http://localhost:5000/api/emergency', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emergencyData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    console.log('✅ Emergency Created Successfully!');
    console.log('📊 AI Analysis:');
    console.log(`   Category: ${result.analysis.category}`);
    console.log(`   Severity: ${result.analysis.severity}`);
    console.log(`   Priority: ${result.analysis.priority}`);
    console.log(`   Recommended Services: ${result.analysis.recommendedServices.join(', ')}`);
    console.log(`   Action Items: ${result.analysis.actionItems.join(', ')}`);
    
  } catch (error) {
    console.error('❌ Error creating emergency:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  await testAIAnalysis();
  await testEmergencyCreation();
}

runAllTests().catch(console.error); 