const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Environment Variables...\n');

// Get the absolute path to the project root
const projectRoot = __dirname;
const envPath = path.join(projectRoot, '.env.local');

console.log('📁 Project root:', projectRoot);
console.log('📄 .env.local path:', envPath);

// Create the .env.local file with the correct content
const envContent = `# Google AI (Gemini) API Key
GOOGLE_AI_API_KEY=AIzaSyBSfeMhSho2u8IDjVo7ybtv0NxMscdKYq4

# Database URL (Neon PostgreSQL)
DATABASE_URL=postgresql://neondb_owner:npg_xqJl5kA7jDBO@ep-empty-silence-a8li7oul-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require

# Web3Auth Configuration
NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=BIca-CIypPqX5gjAaehVuNwr-1yDkXhpeIdUHYNjBH4Cb7szD1PdZiVAw5V2G6kzmQncMWe4lD3a-REZlKGARnc
`;

// Write the .env.local file
try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env.local file created/updated successfully');
  
  // Verify the file was created
  if (fs.existsSync(envPath)) {
    const fileContent = fs.readFileSync(envPath, 'utf8');
    console.log('📄 File content:');
    console.log(fileContent);
  }
} catch (error) {
  console.error('❌ Error creating .env.local:', error);
  process.exit(1);
}

// Also create a .env file as backup (some setups use this)
const envBackupPath = path.join(projectRoot, '.env');
try {
  fs.writeFileSync(envBackupPath, envContent);
  console.log('✅ .env backup file created');
} catch (error) {
  console.log('⚠️ Could not create .env backup:', error.message);
}

// Check if we're in the right directory
const packageJsonPath = path.join(projectRoot, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ package.json not found. Are you in the correct directory?');
  process.exit(1);
}

console.log('\n🎯 Next Steps:');
console.log('1. STOP your development server (Ctrl+C)');
console.log('2. Run: npm run dev');
console.log('3. Test: http://localhost:3000/api/test-env');
console.log('4. Should show all environment variables as "Set"');

console.log('\n⚠️ IMPORTANT: You MUST restart the development server for environment variables to load!');

console.log('\n✨ Environment setup complete!'); 