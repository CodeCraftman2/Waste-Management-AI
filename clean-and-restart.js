const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 Comprehensive Cleanup and Restart...\n');

// Function to safely remove directories
function removeDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`✅ Removed: ${dirPath}`);
      return true;
    } catch (error) {
      console.log(`⚠️ Could not remove ${dirPath}:`, error.message);
      return false;
    }
  } else {
    console.log(`ℹ️ Directory not found: ${dirPath}`);
    return true;
  }
}

// Clean Next.js build cache
console.log('🗑️ Cleaning Next.js cache...');
removeDirectory('.next');
removeDirectory('out');

// Clean node_modules (optional, but can help with dependency issues)
console.log('\n📦 Cleaning node_modules...');
removeDirectory('node_modules');

// Clean package-lock.json
if (fs.existsSync('package-lock.json')) {
  try {
    fs.unlinkSync('package-lock.json');
    console.log('✅ Removed package-lock.json');
  } catch (error) {
    console.log('⚠️ Could not remove package-lock.json:', error.message);
  }
}

// Reinstall dependencies
console.log('\n📦 Reinstalling dependencies...');
try {
  execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully');
} catch (error) {
  console.log('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Ensure .env.local exists
console.log('\n🔧 Setting up environment...');
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  const envContent = `# Google AI (Gemini) API Key
GOOGLE_AI_API_KEY=AIzaSyBSfeMhSho2u8IDjVo7ybtv0NxMscdKYq4

# Database URL (Neon PostgreSQL)
DATABASE_URL=postgresql://neondb_owner:npg_xqJl5kA7jDBO@ep-empty-silence-a8li7oul-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require

# Web3Auth Configuration
NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=BIca-CIypPqX5gjAaehVuNwr-1yDkXhpeIdUHYNjBH4Cb7szD1PdZiVAw5V2G6kzmQncMWe4lD3a-REZlKGARnc
`;
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env.local created');
} else {
  console.log('✅ .env.local already exists');
}

// Set up database
console.log('\n🗄️ Setting up database...');
try {
  execSync('node scripts/setup-db.js', { stdio: 'inherit' });
  console.log('✅ Database setup completed');
} catch (error) {
  console.log('⚠️ Database setup failed:', error.message);
}

console.log('\n🎯 Ready to start!');
console.log('Run: npm run dev');
console.log('\n✨ Cleanup complete!'); 