#!/usr/bin/env node

/**
 * Test script to verify AI functionality
 * Usage: node test-ai.js <image-path>
 */

const fs = require('fs');
const path = require('path');

// Test function to simulate API call
async function testAIAnalysis(imagePath) {
  if (!fs.existsSync(imagePath)) {
    console.error('❌ Image file not found:', imagePath);
    return;
  }

  console.log('🧪 Testing AI Analysis...');
  console.log('📁 Image path:', imagePath);
  
  // Read image file
  const imageBuffer = fs.readFileSync(imagePath);
  const imageBlob = new Blob([imageBuffer]);
  
  // Create FormData (Node.js environment simulation)
  const FormData = require('form-data');
  const formData = new FormData();
  formData.append('image', imageBuffer, {
    filename: path.basename(imagePath),
    contentType: 'image/jpeg'
  });

  try {
    // Test API endpoint (requires development server running)
    const fetch = require('node-fetch');
    const response = await fetch('http://localhost:3000/api/analyze-waste', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ AI Analysis successful!');
      console.log('📊 Results:');
      console.log('   Waste Type:', result.result.wasteType);
      console.log('   Confidence:', result.result.confidence + '%');
      console.log('   Description:', result.result.description);
      console.log('   Amount:', result.result.estimatedAmount);
      console.log('   Hazardous:', result.result.isHazardous ? 'Yes' : 'No');
      console.log('   Recommendations:', result.result.recommendations.join(', '));
    } else {
      console.error('❌ AI Analysis failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
    console.log('💡 Make sure development server is running: npm run dev');
  }
}

// Main execution
const imagePath = process.argv[2];
if (!imagePath) {
  console.log('Usage: node test-ai.js <image-path>');
  console.log('Example: node test-ai.js ./test-images/bottle.jpg');
  process.exit(1);
}

testAIAnalysis(imagePath);