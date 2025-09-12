const { neon } = require('@neondatabase/serverless');

async function updateDatabaseSchema() {
  console.log('🔄 Updating Database Schema...\n');
  
  try {
    const sql = neon(process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_xqJl5kA7jDBO@ep-empty-silence-a8li7oul-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require');
    
    console.log('📋 Current reports table structure:');
    const currentColumns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'reports'
      ORDER BY ordinal_position
    `;
    
    currentColumns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // Check what changes are needed
    const hasDescription = currentColumns.some(col => col.column_name === 'description');
    const hasVerificationStatus = currentColumns.some(col => col.column_name === 'verification_status');
    const hasAiAnalysis = currentColumns.some(col => col.column_name === 'ai_analysis');
    const hasAmount = currentColumns.some(col => col.column_name === 'amount');
    const hasVerificationResult = currentColumns.some(col => col.column_name === 'verification_result');
    
    console.log('\n🔍 Schema analysis:');
    console.log(`  - Has 'description' column: ${hasDescription}`);
    console.log(`  - Has 'verification_status' column: ${hasVerificationStatus}`);
    console.log(`  - Has 'ai_analysis' column: ${hasAiAnalysis}`);
    console.log(`  - Has 'amount' column: ${hasAmount}`);
    console.log(`  - Has 'verification_result' column: ${hasVerificationResult}`);
    
    // Update schema
    console.log('\n🔧 Updating schema...');
    
    // Add description column if it doesn't exist
    if (!hasDescription) {
      console.log('➕ Adding description column...');
      await sql`ALTER TABLE reports ADD COLUMN description TEXT`;
      console.log('✅ Description column added');
    }
    
    // Add verification_status column if it doesn't exist
    if (!hasVerificationStatus) {
      console.log('➕ Adding verification_status column...');
      await sql`ALTER TABLE reports ADD COLUMN verification_status VARCHAR(50) DEFAULT 'pending'`;
      console.log('✅ Verification_status column added');
    }
    
    // Add ai_analysis column if it doesn't exist
    if (!hasAiAnalysis) {
      console.log('➕ Adding ai_analysis column...');
      await sql`ALTER TABLE reports ADD COLUMN ai_analysis JSONB`;
      console.log('✅ Ai_analysis column added');
    }
    
    // Remove old columns if they exist
    if (hasAmount) {
      console.log('➖ Removing old amount column...');
      await sql`ALTER TABLE reports DROP COLUMN amount`;
      console.log('✅ Amount column removed');
    }
    
    if (hasVerificationResult) {
      console.log('➖ Removing old verification_result column...');
      await sql`ALTER TABLE reports DROP COLUMN verification_result`;
      console.log('✅ Verification_result column removed');
    }
    
    console.log('\n📋 Updated reports table structure:');
    const updatedColumns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'reports'
      ORDER BY ordinal_position
    `;
    
    updatedColumns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // Test the updated schema
    console.log('\n🧪 Testing updated schema...');
    const testReport = await sql`
      INSERT INTO reports (user_id, location, waste_type, description, verification_status, status)
      VALUES (1, 'Test Location', 'plastic', 'Test description', 'pending', 'pending')
      RETURNING id
    `;
    console.log('✅ Test report inserted successfully, ID:', testReport[0].id);
    
    // Clean up test data
    await sql`DELETE FROM reports WHERE id = ${testReport[0].id}`;
    console.log('🧹 Test data cleaned up');
    
    console.log('\n✨ Database schema updated successfully!');
    console.log('🎯 You can now submit reports with AI verification.');
    
  } catch (error) {
    console.error('❌ Schema update failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check if you have write permissions to the database');
    console.log('2. Verify your Neon database is active');
    console.log('3. Check the connection string is correct');
  }
}

updateDatabaseSchema(); 