const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up environment variables...\n');

// Check if .env.local exists
const envPath = path.join(__dirname, '.env.local');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('✅ .env.local file exists');
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('📄 Current .env.local content:');
  console.log(envContent);
} else {
  console.log('❌ .env.local file not found');
  console.log('📝 Creating .env.local file...');
  
  const envContent = `# Google AI (Gemini) API Key
GOOGLE_AI_API_KEY=AIzaSyBSfeMhSho2u8IDjVo7ybtv0NxMscdKYq4

# Database URL (Neon PostgreSQL)
DATABASE_URL=postgresql://neondb_owner:npg_xqJl5kA7jDBO@ep-empty-silence-a8li7oul-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require

# Web3Auth Configuration
NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=BIca-CIypPqX5gjAaehVuNwr-1yDkXhpeIdUHYNjBH4Cb7szD1PdZiVAw5V2G6kzmQncMWe4lD3a-REZlKGARnc
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env.local file created successfully!');
}

console.log('\n🎯 Next Steps:');
console.log('1. Restart your development server: npm run dev');
console.log('2. Test environment: http://localhost:3000/api/test-env');
console.log('3. Test AI: Upload an image on the Report Waste page');

console.log('\n✨ Environment setup complete!'); 