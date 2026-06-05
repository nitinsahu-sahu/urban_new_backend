const { pool } = require("../../../dbhelper");

const get_user_model = async (
  user_id,
  page,
  limit,
  is_active,
  is_deleted,
  search
) => {
  try {
    let query = `SELECT  COUNT(*) OVER() as count,* FROM users WHERE 1 = 1`; // Start with a base query
    const values = [];

    // Apply filters
    if (user_id) {
      query += ` AND user_id = $${values.length + 1}`;
      values.push(user_id);
    }
    if (is_active !== undefined) {
      query += ` AND is_active = $${values.length + 1}`;
      values.push(is_active);
    }
    if (is_deleted !== undefined) {
      query += ` AND is_deleted = $${values.length + 1}`;
      values.push(is_deleted);
    }
    if (search) {
      query += ` AND (full_name ILIKE $${values.length + 1} OR email ILIKE $${
        values.length + 2
      } OR phone::text ILIKE $${values.length + 3})`;
      values.push(`%${search}%`);
      values.push(`%${search}%`);
      values.push(`%${search}%`);
    }

    // Add pagination
    if (limit && page) {
      query += ` ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${
        values.length + 2
      }`;
      values.push(limit);
      values.push((page - 1) * limit);
    }

    const result = await pool.query(query, values);
    console.log(result.rows)
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
    console.log(error);
    return {
      success: false,
      message: "An unexpected error occurred while fetching user data.",
      data: [],
      count: 0,
    };
  }
};

module.exports = {
  get_user_model,
};
