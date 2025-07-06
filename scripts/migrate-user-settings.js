const { neon } = require('@neondatabase/serverless');

async function migrateUserSettings() {
  const sql = neon(process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_xqJl5kA7jDBO@ep-empty-silence-a8li7oul-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require');
  
  try {
    console.log('🔄 Adding UserSettings table...');
    
    // Create UserSettings table
    await sql`
      CREATE TABLE IF NOT EXISTS user_settings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) NOT NULL UNIQUE,
        email_notifications BOOLEAN NOT NULL DEFAULT true,
        push_notifications BOOLEAN NOT NULL DEFAULT true,
        report_notifications BOOLEAN NOT NULL DEFAULT true,
        collection_notifications BOOLEAN NOT NULL DEFAULT false,
        leaderboard_notifications BOOLEAN NOT NULL DEFAULT true,
        profile_visible BOOLEAN NOT NULL DEFAULT true,
        show_location BOOLEAN NOT NULL DEFAULT false,
        show_stats BOOLEAN NOT NULL DEFAULT true,
        bio TEXT,
        location VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;
    
    console.log('✅ UserSettings table created successfully!');
    console.log('📝 You can now use the settings page with full functionality.');
    
  } catch (error) {
    console.error('❌ Error creating UserSettings table:', error);
    process.exit(1);
  }
}

migrateUserSettings(); 