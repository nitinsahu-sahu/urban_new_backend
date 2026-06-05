// models/payment/payment.model.js
const { pool } = require("../../dbhelper");
const { current_epoch_time } = require("../methods/current_epoch_time");
const { random_number } = require("../methods/random_number");
const { 
  generate_merchant_transaction_id,
  generate_merchant_order_id,
  format_amount_to_paise
} = require("../methods/payment/payment_methods");


const create_payment_model = async (user_id, amount, callback_url, metadata = {}, custom_order_id = null) => {
  try {
    const created_at = current_epoch_time();
    const payment_id = random_number();
    const merchant_transaction_id = generate_merchant_transaction_id();
    const merchant_order_id = custom_order_id || generate_merchant_order_id();
    const amount_in_paise = format_amount_to_paise(amount);

    const query = `
      INSERT INTO paymentstable (
        id, payment_id, user_id, merchant_transaction_id, merchant_order_id,
        amount, currency, status, callback_url, metadata, created_at, is_active, is_deleted
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, 'INR', 'PENDING', $6, $7, $8, true, false
      )
      RETURNING *;
    `;

    const values = [
      payment_id,
      user_id,
      merchant_transaction_id,
      merchant_order_id,  // ✅ Custom order ID support
      amount_in_paise,
      callback_url,
      JSON.stringify(metadata),
      created_at
    ];

    const result = await pool.query(query, values);

    if (result.rows.length > 0) {
      return {
        success: true,
        message: "Payment record created successfully",
        data: result.rows[0]
      };
    } else {
      return {
        success: false,
        message: "Failed to create payment record"
      };
    }
  } catch (error) {
    console.error("Error in create_payment_model:", error);
    return {
      success: false,
      error: "An unexpected error occurred while creating payment record"
    };
  }
};

const get_payment_by_transaction_id_model = async (merchant_transaction_id) => {
  try {
    const query = `
      SELECT * FROM paymentsTable
      WHERE merchant_transaction_id = $1 
      AND is_active = true 
      AND is_deleted = false
    `;
    const values = [merchant_transaction_id];
    const result = await pool.query(query, values);

    if (result.rows.length > 0) {
      return {
        success: true,
        message: "Payment record found",
        data: result.rows[0]
      };
    } else {
      return {
        success: false,
        message: "Payment record not found"
      };
    }
  } catch (error) {
    console.error("Error in get_payment_by_transaction_id_model:", error);
    return {
      success: false,
      error: "An unexpected error occurred while fetching payment record"
    };
  }
};

const update_payment_status_model = async (merchant_transaction_id, status, phonepe_transaction_id = null, phonepe_response = null) => {
  try {
    const updated_at = current_epoch_time();
    
    let query = `
      UPDATE paymentsTable 
      SET status = $1, updated_at = $2
    `;
    let values = [status, updated_at];
    let paramCount = 3;

    if (phonepe_transaction_id) {
      query += `, phonepe_transaction_id = $${paramCount}`;
      values.push(phonepe_transaction_id);
      paramCount++;
    }

    if (phonepe_response) {
      query += `, phonepe_response = $${paramCount}`;
      values.push(JSON.stringify(phonepe_response));
      paramCount++;
    }

    query += ` WHERE merchant_transaction_id = $${paramCount} AND is_active = true AND is_deleted = false RETURNING *;`;
    values.push(merchant_transaction_id);

    const result = await pool.query(query, values);

    if (result.rows.length > 0) {
      return {
        success: true,
        message: "Payment status updated successfully",
        data: result.rows[0]
      };
    } else {
      return {
        success: false,
        message: "Payment record not found or update failed"
      };
    }
  } catch (error) {
    console.error("Error in update_payment_status_model:", error);
    return {
      success: false,
      error: "An unexpected error occurred while updating payment status"
    };
  }
};

const update_payment_refund_model = async (merchant_transaction_id, metadata) => {
  try {
    const updated_at = current_epoch_time();
    
    const query = `
      UPDATE paymentsTable 
      SET status = 'REFUNDED', 
          metadata = $1, 
          updated_at = $2 
      WHERE merchant_transaction_id = $3 
      AND is_active = true 
      AND is_deleted = false 
      RETURNING *;
    `;
    
    const values = [JSON.stringify(metadata), updated_at, merchant_transaction_id];
    const result = await pool.query(query, values);

    if (result.rows.length > 0) {
      return {
        success: true,
        message: "Payment refund updated successfully",
        data: result.rows[0]
      };
    } else {
      return {
        success: false,
        message: "Payment record not found or refund update failed"
      };
    }
  } catch (error) {
    console.error("Error in update_payment_refund_model:", error);
    return {
      success: false,
      error: "An unexpected error occurred while updating payment refund"
    };
  }
};

const get_user_payments_model = async (user_id, page = 1, limit = 10, status = null) => {
  try {
    const offset = (page - 1) * limit;
    
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM paymentsTable 
      WHERE user_id = $1 
      AND is_active = true 
      AND is_deleted = false
    `;
    
    let query = `
      SELECT * FROM paymentsTable 
      WHERE user_id = $1 
      AND is_active = true 
      AND is_deleted = false
    `;
    
    let values = [user_id];
    let paramCount = 2;

    if (status) {
      countQuery += ` AND status = $${paramCount}`;
      query += ` AND status = $${paramCount}`;
      values.push(status);
      paramCount++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    const [countResult, dataResult] = await Promise.all([
      pool.query(countQuery, values.slice(0, paramCount)),
      pool.query(query, values)
    ]);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      message: "Payment history retrieved successfully",
      data: {
        payments: dataResult.rows,
        total: total,
        page: parseInt(page),
        totalPages: totalPages,
        limit: parseInt(limit)
      }
    };
  } catch (error) {
    console.error("Error in get_user_payments_model:", error);
    return {
      success: false,
      error: "An unexpected error occurred while fetching payment history"
    };
  }
};

const get_payment_by_id_model = async (payment_id, user_id) => {
  try {
    const query = `
      SELECT * FROM paymentsTable 
      WHERE id = $1 
      AND user_id = $2 
      AND is_active = true 
      AND is_deleted = false
    `;
    const values = [payment_id, user_id];
    const result = await pool.query(query, values);

    if (result.rows.length > 0) {
      return {
        success: true,
        message: "Payment record found",
        data: result.rows[0]
      };
    } else {
      return {
        success: false,
        message: "Payment record not found"
      };
    }
  } catch (error) {
    console.error("Error in get_payment_by_id_model:", error);
    return {
      success: false,
      error: "An unexpected error occurred while fetching payment record"
    };
  }
};

module.exports = {
  create_payment_model,
  get_payment_by_transaction_id_model,
  update_payment_status_model,
  update_payment_refund_model,
  get_user_payments_model,
  get_payment_by_id_model
};