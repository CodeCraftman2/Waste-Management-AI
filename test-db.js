const { neon } = require('@neondatabase/serverless');

async function testDatabase() {
  console.log('🗄️ Testing Database Connection...\n');
  
  try {
    // Test database connection
    const sql = neon(process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_xqJl5kA7jDBO@ep-empty-silence-a8li7oul-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require');
    
    console.log('🔗 Testing connection...');
    const result = await sql`SELECT NOW() as current_time`;
    console.log('✅ Database connection successful:', result[0]);
    
    // Check if tables exist
    console.log('\n📋 Checking tables...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    console.log('📊 Found tables:');
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });
    
    // Check if reports table has the right structure
    console.log('\n🔍 Checking reports table structure...');
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'reports'
      ORDER BY ordinal_position
    `;
    
    if (columns.length > 0) {
      console.log('✅ Reports table exists with columns:');
      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
    } else {
      console.log('❌ Reports table not found!');
      console.log('💡 Run: node scripts/setup-db.js to create tables');
    }
    
    // Test inserting a sample report
    console.log('\n🧪 Testing report insertion...');
    try {
      const testReport = await sql`
        INSERT INTO reports (user_id, location, waste_type, description, verification_status, status)
        VALUES (1, 'Test Location', 'plastic', 'Test description', 'pending', 'pending')
        RETURNING id
      `;
      console.log('✅ Test report inserted successfully, ID:', testReport[0].id);
      
      // Clean up test data
      await sql`DELETE FROM reports WHERE id = ${testReport[0].id}`;
      console.log('🧹 Test data cleaned up');
      
    } catch (insertError) {
      console.log('❌ Failed to insert test report:', insertError.message);
      console.log('💡 This might indicate a schema issue');
    }
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check if DATABASE_URL is set correctly');
    console.log('2. Run: node scripts/setup-db.js to create tables');
    console.log('3. Verify your Neon database is active');
  }
}

testDatabase(); 