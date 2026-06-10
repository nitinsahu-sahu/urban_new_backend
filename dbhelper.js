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
    await client.query('BEGIN');

    // ========== DROP OLD TABLE (If structure changed) ==========
    // ⚠️ Production में carefully use करें - data loss हो सकता है
    const dropOld = false; // true करें अगर fresh start करना है
    
    if (dropOld) {
      await client.query('DROP TABLE IF EXISTS refunds CASCADE;');
      await client.query('DROP TABLE IF EXISTS paymentsTable CASCADE;');
      await client.query('DROP TABLE IF EXISTS paymentstable CASCADE;');
    }

    // ========== CHECK IF TABLE EXISTS ==========
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'paymentstable'
      );
    `);

    const tableExists = tableCheck.rows[0].exists;

    if (!tableExists) {
      // ========== CREATE PAYMENTS TABLE ==========
      await client.query(`
        CREATE TABLE paymentstable (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          payment_id VARCHAR(255) NOT NULL,
          user_id VARCHAR(255) NOT NULL,
          merchant_transaction_id VARCHAR(255) UNIQUE NOT NULL,
          merchant_order_id VARCHAR(255) NOT NULL,
          phonepe_transaction_id VARCHAR(255),
          amount INTEGER NOT NULL,
          currency VARCHAR(10) DEFAULT 'INR',
          status VARCHAR(50) DEFAULT 'PENDING',
          phonepe_response JSONB,
          phonepe_webhook_response JSONB,
          callback_url TEXT,
          metadata JSONB DEFAULT '{}',
          payment_completed_at TIMESTAMP,
          created_at BIGINT NOT NULL,
          updated_at BIGINT,
          is_active BOOLEAN DEFAULT true,
          is_deleted BOOLEAN DEFAULT false
        );
      `);
    } else {
      
      // Check and add phonepe_webhook_response
      await addColumnIfNotExists(client, 'paymentstable', 
        'phonepe_webhook_response', 'JSONB');
      
      // Check and add payment_completed_at
      await addColumnIfNotExists(client, 'paymentstable', 
        'payment_completed_at', 'TIMESTAMP');
      
      // Check and add phonepe_response (if old table doesn't have it)
      await addColumnIfNotExists(client, 'paymentstable', 
        'phonepe_response', 'JSONB');
      
      // Check and add phonepe_transaction_id
      await addColumnIfNotExists(client, 'paymentstable', 
        'phonepe_transaction_id', 'VARCHAR(255)');
      
    }

    // ========== CREATE INDEXES ==========
    const indexes = [
      { name: 'idx_paymentstable_merchant_txn', column: 'merchant_transaction_id' },
      { name: 'idx_paymentstable_user_id', column: 'user_id' },
      { name: 'idx_paymentstable_status', column: 'status' },
      { name: 'idx_paymentstable_created_at', column: 'created_at DESC' },
      { name: 'idx_paymentstable_phonepe_txn', column: 'phonepe_transaction_id' },
    ];

    for (const index of indexes) {
      try {
        await client.query(`
          CREATE INDEX IF NOT EXISTS ${index.name} 
          ON paymentstable(${index.column});
        `);
      } catch (err) {
        console.warn(`  ⚠️  Could not create ${index.name}:`, err.message);
      }
    }

    // ========== CREATE REFUNDS TABLE ==========
    const refundTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'refunds'
      );
    `);

    if (!refundTableCheck.rows[0].exists) {
      await client.query(`
        CREATE TABLE refunds (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          payment_id UUID REFERENCES paymentstable(id) ON DELETE CASCADE,
          refund_transaction_id VARCHAR(255) UNIQUE NOT NULL,
          original_transaction_id VARCHAR(255),
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
    } else {
      console.log('ℹ️  refunds table already exists');
    }

    await client.query('COMMIT');
    
    // ========== PRINT TABLE STRUCTURE ==========
    const structure = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'paymentstable' 
      ORDER BY ordinal_position;
    `);
    console.table(structure.rows);
    

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Database initialization failed:', error.message);
    console.error('Details:', error.detail || 'No additional details');
    throw error;
  } finally {
    client.release();
  }
};

// ========== HELPER: Add column if not exists ==========
const addColumnIfNotExists = async (client, tableName, columnName, columnType) => {
  try {
    const columnCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = $1 
        AND column_name = $2
      );
    `, [tableName, columnName]);

    if (!columnCheck.rows[0].exists) {
      await client.query(`
        ALTER TABLE ${tableName} 
        ADD COLUMN ${columnName} ${columnType};
      `);
    } else {
      console.log(`  ℹ️  Column ${columnName} already exists`);
    }
  } catch (error) {
    console.warn(`  ⚠️  Could not add ${columnName}:`, error.message);
  }
};

// ========== EXPORT ==========
module.exports = {
  pool,
  initializeDatabase
};