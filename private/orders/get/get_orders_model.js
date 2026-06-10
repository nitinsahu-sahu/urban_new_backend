const { pool } = require("../../../dbhelper");

const get_orders_model = async (
  user_id,
  address_id,
  page = 1,
  limit = 10,
  order_status,
  search,
  start_date,
  end_date
) => {
  try {
    let query = `SELECT 
    o.*,
    COUNT(*) OVER() AS count,
    JSON_BUILD_OBJECT(
      'full_name', u.full_name,
      'phone', u.phone,
      'email', u.email
    ) AS user_info,
    JSON_BUILD_OBJECT(
      'pincode', a.pincode, 
      'city', a.city,
      'state', a.state,
      'full_address', a.full_address
    ) AS address_info
FROM 
    orders o
LEFT JOIN 
    users u ON o.user_id = u.user_id
LEFT JOIN
    address a ON o.address_id = a.address_id
WHERE 
    1 = 1`; // Start with a base query
    const values = [];

    if (user_id) {
      query += ` AND o.user_id = $${
        values.length + 1
      } AND o.is_deleted = false`;
      values.push(user_id);
    }
    if (search) {
      query += ` AND (u.full_name ILIKE $${
        values.length + 1
      } OR u.phone::text ILIKE $${values.length + 1} OR u.email ILIKE $${
        values.length + 1
      })`;
      values.push(`%${search}%`);
    }
    if (address_id) {
      query += ` AND o.address_id = $${values.length + 1}`;
      values.push(address_id);
    }
    if (order_status) {
      if (order_status === "MY_ORDERS") {
        query += ` AND o.status != 'IN_CART' AND o.is_deleted = false`;
      } else if (order_status === "ALL") {
      } else {
        query += ` AND o.status = $${
          values.length + 1
        } AND o.is_deleted = false`;
        values.push(order_status);
      }
    }

    if (start_date) {
      query += ` AND o.created_at >= $${values.length + 1}`;
      values.push(start_date);
    }
    if (end_date) {
      query += ` AND o.created_at <= $${values.length + 1}`;
      values.push(end_date);
    }

    // Add pagination
    if (limit && page) {
      query += ` GROUP BY
      o.order_id, u.full_name, u.phone, u.email, a.state, a.pincode, a.city, a.full_address
      ORDER BY o.created_at DESC
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
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
      message: "An unexpected error occurred while fetching order data.",
      data: [],
      count: 0,
    };
  }
};

module.exports = {
  get_orders_model,
};
