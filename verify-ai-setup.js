#!/usr/bin/env node

/**
 * AI Setup Verification Script
 * Checks current AI configuration and provides setup guidance
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 AI Setup Verification\n');

// Check environment files
const envFiles = ['.env.local', '.env', '.env.example'];
let envFound = false;

envFiles.forEach(file => {
  const envPath = path.join(process.cwd(), file);
  if (fs.existsSync(envPath)) {
    console.log(`✅ Found: ${file}`);
    envFound = true;
    
    // Read and check for AI-related env vars
    const envContent = fs.readFileSync(envPath, 'utf8');
    const aiKeys = [
      'GOOGLE_AI_API_KEY',
      'OPENAI_API_KEY', 
      'ANTHROPIC_API_KEY',
      'AZURE_COMPUTER_VISION_KEY'
    ];
    
    aiKeys.forEach(key => {
      if (envContent.includes(key)) {
        const hasValue = envContent.includes(`${key}=`) && 
                        !envContent.includes(`${key}=your_`) &&
                        !envContent.includes(`${key}=`);
        console.log(`   ${hasValue ? '✅' : '⚠️ '} ${key}${hasValue ? ' (configured)' : ' (needs value)'}`);
      }
    });
  }
});

if (!envFound) {
  console.log('❌ No environment files found');
  console.log('💡 Create .env.local file with required API keys');
}

// Check main AI files
console.log('\n🔧 AI Implementation Files:');

const aiFiles = [
  'app/api/analyze-waste/route.ts',
  'utils/aiVerification.ts',
  'app/report/page.tsx'
];

aiFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
    
    // Check what AI service is being used
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('@google/generative-ai')) {
      console.log('   📄 Uses: Google Gemini AI');
    }
    if (content.includes('openai')) {
      console.log('   📄 Uses: OpenAI');
    }
    if (content.includes('@anthropic-ai/sdk')) {
      console.log('   📄 Uses: Anthropic Claude');
    }
  } else {
    console.log(`❌ Missing: ${file}`);
  }
});

// Check package.json for AI dependencies
console.log('\n📦 AI Dependencies:');
const packagePath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const aiDeps = {
    '@google/generative-ai': 'Google Gemini',
    'openai': 'OpenAI GPT',
    '@anthropic-ai/sdk': 'Anthropic Claude',
    '@azure/cognitiveservices-computervision': 'Azure Computer Vision'
  };
  
  let foundAIDeps = false;
  Object.entries(aiDeps).forEach(([pkg, name]) => {
    if (deps[pkg]) {
      console.log(`✅ ${name}: ${pkg}@${deps[pkg]}`);
      foundAIDeps = true;
    }
  });
  
  if (!foundAIDeps) {
    console.log('❌ No AI dependencies found');
  }
} else {
  console.log('❌ package.json not found');
}

// Provide recommendations
console.log('\n💡 Recommendations:');
console.log('1. Ensure .env.local exists with proper API keys');
console.log('2. Run "npm install --legacy-peer-deps" to install dependencies');
console.log('3. Run "npm run dev" to start development server');
console.log('4. Test AI endpoint with: curl -X POST http://localhost:3000/api/analyze-waste -F "image=@test.jpg"');
console.log('5. Read AI_CHANGE_GUIDE.md for detailed change instructions');

console.log('\n📚 For complete guide on changing AI services, see: AI_CHANGE_GUIDE.md');