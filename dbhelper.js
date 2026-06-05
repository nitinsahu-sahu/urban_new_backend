require("dotenv").config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE_NAME,
  password: process.env.DB_DATABASE_PASSWORD,
  port: process.env.DB_PORT,
});

// ========== DATABASE INITIALIZATION FUNCTION ==========
const initializeDatabase = async () => {
  const client = await pool.connect();
  
  try {
    console.log('\n🔄 Database tables initialize ho rahi hain...\n');
    
    await client.query('BEGIN');

    // ========== CHECK IF TABLE EXISTS ==========
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'paymentsTable'
      );
    `);

    const tableExists = tableCheck.rows[0].exists;

    if (!tableExists) {
      // ========== CREATE PAYMENTS TABLE ==========
      console.log('📝 Creating paymentsTable...');
      await client.query(`
        CREATE TABLE paymentsTable (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          payment_id VARCHAR(255) NOT NULL,
          user_id VARCHAR(255) NOT NULL,
          merchant_transaction_id VARCHAR(255) UNIQUE NOT NULL,
          merchant_order_id VARCHAR(255) NOT NULL,
          amount INTEGER NOT NULL,
          currency VARCHAR(10) DEFAULT 'INR',
          status VARCHAR(50) DEFAULT 'PENDING',
          phonepe_transaction_id VARCHAR(255),
          phonepe_response JSONB,
          callback_url TEXT,
          metadata JSONB DEFAULT '{}',
          created_at BIGINT NOT NULL,
          updated_at BIGINT,
          is_active BOOLEAN DEFAULT true,
          is_deleted BOOLEAN DEFAULT false
        );
      `);
      console.log('✅ paymentsTable created successfully');
    } else {
      console.log('ℹ️  paymentsTable already exists');
      
      // Check if merchant_transaction_id column exists
      const columnCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'paymentsTable' 
          AND column_name = 'merchant_transaction_id'
        );
      `);

      if (!columnCheck.rows[0].exists) {
        console.log('⚠️  Old table structure detected, recreating table...');
        
        // Drop old table
        await client.query('DROP TABLE IF EXISTS paymentsTable CASCADE;');
        
        // Create new table with correct structure
        await client.query(`
          CREATE TABLE paymentsTable (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            payment_id VARCHAR(255) NOT NULL,
            user_id VARCHAR(255) NOT NULL,
            merchant_transaction_id VARCHAR(255) UNIQUE NOT NULL,
            merchant_order_id VARCHAR(255) NOT NULL,
            amount INTEGER NOT NULL,
            currency VARCHAR(10) DEFAULT 'INR',
            status VARCHAR(50) DEFAULT 'PENDING',
            phonepe_transaction_id VARCHAR(255),
            phonepe_response JSONB,
            callback_url TEXT,
            metadata JSONB DEFAULT '{}',
            created_at BIGINT NOT NULL,
            updated_at BIGINT,
            is_active BOOLEAN DEFAULT true,
            is_deleted BOOLEAN DEFAULT false
          );
        `);
        console.log('✅ paymentsTable recreated with correct structure');
      }
    }

    // ========== CREATE INDEXES ==========
    console.log('\n📊 Creating indexes...');
    
    try {
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_paymentsTable_merchant_txn 
        ON paymentsTable(merchant_transaction_id);
      `);
      console.log('  ✅ Index: merchant_transaction_id');
    } catch (err) {
      console.warn('  ⚠️  Could not create merchant_transaction_id index:', err.message);
    }

    try {
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_paymentsTable_user_id 
        ON paymentsTable(user_id);
      `);
      console.log('  ✅ Index: user_id');
    } catch (err) {
      console.warn('  ⚠️  Could not create user_id index:', err.message);
    }

    try {
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_paymentsTable_status 
        ON paymentsTable(status);
      `);
      console.log('  ✅ Index: status');
    } catch (err) {
      console.warn('  ⚠️  Could not create status index:', err.message);
    }

    try {
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_paymentsTable_created_at 
        ON paymentsTable(created_at DESC);
      `);
      console.log('  ✅ Index: created_at');
    } catch (err) {
      console.warn('  ⚠️  Could not create created_at index:', err.message);
    }

    // ========== CREATE REFUNDS TABLE (OPTIONAL) ==========
    const refundTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'refunds'
      );
    `);

    if (!refundTableCheck.rows[0].exists) {
      console.log('\n📝 Creating refunds table...');
      await client.query(`
        CREATE TABLE refunds (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          payment_id UUID REFERENCES paymentsTable(id) ON DELETE CASCADE,
          refund_transaction_id VARCHAR(255) UNIQUE NOT NULL,
          amount INTEGER NOT NULL,
          reason TEXT,
          status VARCHAR(50) DEFAULT 'INITIATED',
          phonepe_response JSONB,
          created_at BIGINT NOT NULL,
          updated_at BIGINT,
          is_active BOOLEAN DEFAULT true,
          is_deleted BOOLEAN DEFAULT false
        );
      `);
      console.log('✅ refunds table created');
    } else {
      console.log('ℹ️  refunds table already exists');
    }

    await client.query('COMMIT');
    console.log('\n🎉 All tables initialized successfully!\n');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Database initialization failed:', error.message);
    console.error('Details:', error.detail || 'No additional details');
    throw error;
  } finally {
    client.release();
  }
};

// ========== EXPORT ==========
module.exports = {
  pool,
  initializeDatabase
};