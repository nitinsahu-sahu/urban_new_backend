const { pool } = require("../../../dbhelper");

const get_payments_model = async (
  payment_id,
  order_id,
  page = 1,
  limit = 10,
  search
) => {
  try {
    let query = `SELECT * ,COUNT(*) OVER() as count FROM payments WHERE 1 = 1`; // Start with a base query
    const values = [];

    if (payment_id) {
      query += ` AND payment_id = $${values.length + 1}`;
      values.push(payment_id);
    }
    if (order_id) {
      query += ` AND order_id = $${values.length + 1}`;
      values.push(order_id);
    }
    if (search) {
      query += ` AND (payment_id ILIKE $${values.length + 1} OR trx_id ILIKE $${values.length + 2} OR status ILIKE $${values.length + 3})`;
      values.push(`%${search}%`);
      values.push(`%${search}%`);
      values.push(`%${search}%`);
    }

    // Add pagination
    if (limit && page) {
      query += ` ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
      values.push(limit);
      values.push((page - 1) * limit);
    }

    const result = await pool.query(query, values);
    const count = result?.rows[0]?.count;

    if (result.rows.length === 0) {
      return {
        success: true,
        message: "No matching records found.",
        data: [],
        count,
      };
    }

    return {
      success: true,
      message: "Data retrieved successfully.",
      count,
      page,
      limit,
      data: result.rows,
    };
  } catch (error) {
    return {
      success: false,
      message: "An unexpected error occurred while fetching payment data.",
      data: [],
      count: 0,
    };
  }
};

module.exports = {
  get_payments_model,
};
