require("dotenv").config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE_NAME,
  password: process.env.DB_DATABASE_PASSWORD,
  port: process.env.DB_PORT,
});

// ========== HELPER: Add column if not exists ==========
const addColumnIfNotExists = async (client, tableName, columnName, columnType, defaultValue = null) => {
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
      let query = `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnType}`;
      if (defaultValue !== null) {
        query += ` DEFAULT ${defaultValue}`;
      }
      await client.query(query);
      console.log(`  ✅ Column ${columnName} added to ${tableName}`);
      return true;
    } else {
      console.log(`  ℹ️  Column ${columnName} already exists in ${tableName}`);
      return false;
    }
  } catch (error) {
    console.warn(`  ⚠️  Could not add ${columnName}:`, error.message);
    return false;
  }
};

// ========== HELPER: Add constraint if not exists ==========
const addConstraintIfNotExists = async (client, tableName, constraintName, constraintDefinition) => {
  try {
    const constraintCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
        AND table_name = $1 
        AND constraint_name = $2
      );
    `, [tableName, constraintName]);

    if (!constraintCheck.rows[0].exists) {
      await client.query(`ALTER TABLE ${tableName} ADD CONSTRAINT ${constraintName} ${constraintDefinition}`);
      console.log(`  ✅ Constraint ${constraintName} added to ${tableName}`);
      return true;
    } else {
      console.log(`  ℹ️  Constraint ${constraintName} already exists`);
      return false;
    }
  } catch (error) {
    console.warn(`  ⚠️  Could not add constraint ${constraintName}:`, error.message);
    return false;
  }
};

// ========== DISCOUNTS TABLE INITIALIZATION ==========
const initializeDiscountsTable = async (client) => {
  
  // ========== CREATE DISCOUNTS TABLE ==========
  const discountsTableCheck = await client.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'discounts'
    );
  `);

  if (!discountsTableCheck.rows[0].exists) {
    // Create main discounts table
    await client.query(`
      CREATE TABLE discounts (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        discount_type VARCHAR(20) NOT NULL,
        discount_value DECIMAL(10,2) NOT NULL,
        applicable_to VARCHAR(20) DEFAULT 'product',
        applicable_ids JSONB DEFAULT '[]',
        applicable_model VARCHAR(20) DEFAULT 'product',
        min_order_amount DECIMAL(10,2) DEFAULT 0,
        max_discount_amount DECIMAL(10,2),
        usage_limit INTEGER,
        used_count INTEGER DEFAULT 0,
        per_user_limit INTEGER DEFAULT 1,
        eligible_users JSONB DEFAULT '[]',
        excluded_users JSONB DEFAULT '[]',
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        is_active BOOLEAN DEFAULT true,
        is_deleted BOOLEAN DEFAULT false,
        stackable BOOLEAN DEFAULT false,
        first_purchase_only BOOLEAN DEFAULT false,
        new_user_only BOOLEAN DEFAULT false,
        priority INTEGER DEFAULT 0,
        created_by VARCHAR(20) DEFAULT 'N/A',
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } else {
    // Add missing columns to existing discounts table
    await addColumnIfNotExists(client, 'discounts', 'stackable', 'BOOLEAN', 'false');
    await addColumnIfNotExists(client, 'discounts', 'priority', 'INTEGER', '0');
    await addColumnIfNotExists(client, 'discounts', 'first_purchase_only', 'BOOLEAN', 'false');
    await addColumnIfNotExists(client, 'discounts', 'new_user_only', 'BOOLEAN', 'false');
    await addColumnIfNotExists(client, 'discounts', 'applicable_to', 'VARCHAR(20)', "'product'");
    await addColumnIfNotExists(client, 'discounts', 'applicable_model', 'VARCHAR(20)', "'product'");
    await addColumnIfNotExists(client, 'discounts', 'applicable_ids', 'JSONB', "'[]'");
    await addColumnIfNotExists(client, 'discounts', 'eligible_users', 'JSONB', "'[]'");
    await addColumnIfNotExists(client, 'discounts', 'excluded_users', 'JSONB', "'[]'");
    await addColumnIfNotExists(client, 'discounts', 'max_discount_amount', 'DECIMAL(10,2)');
    await addColumnIfNotExists(client, 'discounts', 'used_count', 'INTEGER', '0');
    await addColumnIfNotExists(client, 'discounts', 'per_user_limit', 'INTEGER', '1');
    await addColumnIfNotExists(client, 'discounts', 'created_by', 'VARCHAR(20)', "'N/A'");
    await addColumnIfNotExists(client, 'discounts', 'metadata', 'JSONB', "'{}'");
    
    // Remove old buy_x_get_y columns if they exist
    try {
      await client.query(`ALTER TABLE discounts DROP COLUMN IF EXISTS buy_quantity`);
      await client.query(`ALTER TABLE discounts DROP COLUMN IF EXISTS get_quantity`);
      await client.query(`ALTER TABLE discounts DROP COLUMN IF EXISTS applicable_product_ids`);
    } catch (err) {
      // Ignore if columns don't exist
    }
  }

  // ========== ADD CONSTRAINTS ==========
  await addConstraintIfNotExists(client, 'discounts', 'valid_discount_type', 
    "CHECK (discount_type IN ('percentage', 'fixed'))");
  
  await addConstraintIfNotExists(client, 'discounts', 'valid_applicable_to', 
    "CHECK (applicable_to = 'product')");
  
  await addConstraintIfNotExists(client, 'discounts', 'valid_applicable_model', 
    "CHECK (applicable_model = 'product')");
  
  await addConstraintIfNotExists(client, 'discounts', 'check_percentage_max', 
    "CHECK ((discount_type = 'percentage' AND discount_value <= 100) OR discount_type != 'percentage')");
  
  await addConstraintIfNotExists(client, 'discounts', 'check_discount_value_positive', 
    "CHECK (discount_value > 0)");
  
  await addConstraintIfNotExists(client, 'discounts', 'check_valid_dates', 
    "CHECK (start_date <= end_date)");
  
  await addConstraintIfNotExists(client, 'discounts', 'check_min_order_amount', 
    "CHECK (min_order_amount >= 0)");

  // ========== CREATE INDEXES ==========
  const discountIndexes = [
    { name: 'idx_discounts_code', column: 'code', condition: 'WHERE is_deleted = false' },
    { name: 'idx_discounts_dates', column: 'start_date, end_date', condition: 'WHERE is_active = true AND is_deleted = false' },
    { name: 'idx_discounts_active', column: 'is_active, is_deleted' },
    { name: 'idx_discounts_priority', column: 'priority DESC, created_at DESC' },
    { name: 'idx_discounts_discount_type', column: 'discount_type' },
    { name: 'idx_discounts_min_order', column: 'min_order_amount' },
  ];

  for (const index of discountIndexes) {
    try {
      const conditionPart = index.condition ? ` ${index.condition}` : '';
      await client.query(`
        CREATE INDEX IF NOT EXISTS ${index.name} 
        ON discounts(${index.column})${conditionPart};
      `);
    } catch (err) {
      console.warn(`  ⚠️  Could not create ${index.name}:`, err.message);
    }
  }

  // ========== CREATE DISCOUNT USAGE TABLE ==========
  const usageTableCheck = await client.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'discount_usage'
    );
  `);

  if (!usageTableCheck.rows[0].exists) {
    await client.query(`
      CREATE TABLE discount_usage (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        discount_id UUID REFERENCES discounts(id) ON DELETE CASCADE,
        user_id VARCHAR(255) NOT NULL,
        order_id VARCHAR(255) NOT NULL,
        discount_amount DECIMAL(10,2) NOT NULL,
        original_amount DECIMAL(10,2) NOT NULL,
        final_amount DECIMAL(10,2) NOT NULL,
        is_successful BOOLEAN DEFAULT true,
        used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create indexes for discount_usage
    const usageIndexes = [
      { name: 'idx_discount_usage_discount_id', column: 'discount_id' },
      { name: 'idx_discount_usage_user_id', column: 'user_id' },
      { name: 'idx_discount_usage_order_id', column: 'order_id' },
      { name: 'idx_discount_usage_used_at', column: 'used_at DESC' },
      { name: 'idx_discount_usage_successful', column: 'is_successful, used_at' },
    ];
    
    for (const index of usageIndexes) {
      try {
        await client.query(`CREATE INDEX IF NOT EXISTS ${index.name} ON discount_usage(${index.column});`);
      } catch (err) {
        console.warn(`  ⚠️  Could not create ${index.name}:`, err.message);
      }
    }
  } else {
    console.log('  ℹ️  Discount usage table already exists');
  }

  // ========== CREATE TRIGGER FOR UPDATED_AT ==========
  const triggerFunctionCheck = await client.query(`
    SELECT EXISTS (
      SELECT FROM pg_proc 
      WHERE proname = 'update_updated_at_column'
    );
  `);

  if (!triggerFunctionCheck.rows[0].exists) {
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);
  }

  // Add triggers
  try {
    await client.query(`
      DROP TRIGGER IF EXISTS update_discounts_updated_at ON discounts;
      CREATE TRIGGER update_discounts_updated_at 
        BEFORE UPDATE ON discounts 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
    `);
    
    await client.query(`
      DROP TRIGGER IF EXISTS update_discount_usage_updated_at ON discount_usage;
      CREATE TRIGGER update_discount_usage_updated_at 
        BEFORE UPDATE ON discount_usage 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
    `);
  } catch (err) {
    console.warn('  ⚠️ Could not create triggers:', err.message);
  }
};

// ========== DATABASE INITIALIZATION FUNCTION ==========
const initializeDatabase = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const dropOld = false; 
    
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

    // ========== CREATE INDEXES FOR PAYMENTSTABLE ==========
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
      console.log('ℹ️  Refunds table already exists');
    }

    // ========== INITIALIZE DISCOUNTS SYSTEM ==========
    await initializeDiscountsTable(client);

    await client.query('COMMIT');
    
    // ========== PRINT TABLE STRUCTURES ==========
    const paymentStructure = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'paymentstable' 
      ORDER BY ordinal_position;
    `);
    
    const discountStructure = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'discounts' 
      ORDER BY ordinal_position;
    `);
    
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
  initializeDatabase,
};