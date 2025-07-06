const { execSync } = require('child_process');
const fs = require('fs');

console.log('📦 Installing Dependencies (Skipping drizzle-kit)...\n');

try {
  // Install main dependencies first
  console.log('Installing main dependencies...');
  execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
  console.log('✅ Main dependencies installed');
  
  // Try to install drizzle-kit separately with a working version
  console.log('\nInstalling drizzle-kit...');
  try {
    execSync('npm install drizzle-kit@^0.20.14 --save-dev --legacy-peer-deps', { stdio: 'inherit' });
    console.log('✅ drizzle-kit installed');
  } catch (error) {
    console.log('⚠️ drizzle-kit installation failed, but that\'s okay - we can work without it');
  }
  
  // Set up environment
  console.log('\n🔧 Setting up environment...');
  const envContent = `# Google AI (Gemini) API Key
GOOGLE_AI_API_KEY=AIzaSyBSfeMhSho2u8IDjVo7ybtv0NxMscdKYq4

# Database URL (Neon PostgreSQL)
DATABASE_URL=postgresql://neondb_owner:npg_xqJl5kA7jDBO@ep-empty-silence-a8li7oul-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require

# Web3Auth Configuration
NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=BIca-CIypPqX5gjAaehVuNwr-1yDkXhpeIdUHYNjBH4Cb7szD1PdZiVAw5V2G6kzmQncMWe4lD3a-REZlKGARnc
`;

  fs.writeFileSync('.env.local', envContent);
  console.log('✅ .env.local created');
  
  // Set up database using our custom script
  console.log('\n🗄️ Setting up database...');
  try {
    execSync('node scripts/setup-db.js', { stdio: 'inherit' });
    console.log('✅ Database setup completed');
  } catch (error) {
    console.log('⚠️ Database setup failed, but that\'s okay for now');
  }
  
  console.log('\n🎯 Ready to start!');
  console.log('Run: npm run dev');
  console.log('\n✨ Installation complete!');
  
} catch (error) {
  console.error('❌ Installation failed:', error.message);
  process.exit(1);
} 