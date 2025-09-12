const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 Restarting ScrapAI Development Environment...\n');

// Check if .env.local exists
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local not found. Creating it...');
  const envContent = `# Google AI (Gemini) API Key
GOOGLE_AI_API_KEY=AIzaSyBSfeMhSho2u8IDjVo7ybtv0NxMscdKYq4

# Database URL (Neon PostgreSQL)
DATABASE_URL=postgresql://neondb_owner:npg_xqJl5kA7jDBO@ep-empty-silence-a8li7oul-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require

# Web3Auth Configuration
NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=BIca-CIypPqX5gjAaehVuNwr-1yDkXhpeIdUHYNjBH4Cb7szD1PdZiVAw5V2G6kzmQncMWe4lD3a-REZlKGARnc
`;
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env.local created');
}

// Clean Next.js cache
console.log('🧹 Cleaning Next.js cache...');
try {
  if (fs.existsSync('.next')) {
    fs.rmSync('.next', { recursive: true, force: true });
    console.log('✅ Cache cleaned');
  }
} catch (error) {
  console.log('⚠️ Could not clean cache:', error.message);
}

// Install dependencies if needed
console.log('📦 Checking dependencies...');
try {
  execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
  console.log('✅ Dependencies installed');
} catch (error) {
  console.log('⚠️ Dependency installation failed:', error.message);
}

console.log('\n🎯 Next Steps:');
console.log('1. Start the development server: npm run dev');
console.log('2. Test environment: http://localhost:3000/api/test-env');
console.log('3. Test AI: Upload an image on the Report Waste page');

console.log('\n✨ Ready to restart! Run: npm run dev'); 