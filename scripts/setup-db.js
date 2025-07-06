const { neon } = require('@neondatabase/serverless');

async function setupDatabase() {
  const sql = neon(process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_xqJl5kA7jDBO@ep-empty-silence-a8li7oul-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require');
  
  try {
    console.log('Setting up database tables...');
    
    // Create Users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;
    
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
    
    // Create Reports table with new schema
    await sql`
      CREATE TABLE IF NOT EXISTS reports (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) NOT NULL,
        location TEXT NOT NULL,
        waste_type VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        image_url TEXT,
        verification_status VARCHAR(50) NOT NULL DEFAULT 'pending',
        ai_analysis JSONB,
        status VARCHAR(255) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        collector_id INTEGER REFERENCES users(id)
      );
    `;
    
    // Create Rewards table
    await sql`
      CREATE TABLE IF NOT EXISTS rewards (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) NOT NULL,
        points INTEGER NOT NULL DEFAULT 0,
        level INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        is_available BOOLEAN NOT NULL DEFAULT true,
        description TEXT,
        name VARCHAR(255) NOT NULL,
        collection_info TEXT NOT NULL
      );
    `;
    
    // Create CollectedWastes table
    await sql`
      CREATE TABLE IF NOT EXISTS collected_wastes (
        id SERIAL PRIMARY KEY,
        report_id INTEGER REFERENCES reports(id) NOT NULL,
        collector_id INTEGER REFERENCES users(id) NOT NULL,
        collection_date TIMESTAMP NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'collected'
      );
    `;
    
    // Create Notifications table
    await sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) NOT NULL,
        is_read BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;
    
    // Create Transactions table
    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) NOT NULL,
        type VARCHAR(20) NOT NULL,
        amount INTEGER NOT NULL,
        description TEXT NOT NULL,
        date TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;
    
    // Create SolanaTransactions table
    await sql`
      CREATE TABLE IF NOT EXISTS solana_transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) NOT NULL,
        transaction_hash VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        amount DECIMAL(18,9) NOT NULL,
        usd_value DECIMAL(10,2) NOT NULL,
        description TEXT NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'confirmed',
        from_address VARCHAR(255),
        to_address VARCHAR(255),
        block_number INTEGER,
        gas_fee DECIMAL(18,9),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;
    
    console.log('✅ Database tables created successfully!');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase(); 