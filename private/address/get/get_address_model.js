const { pool } = require("../../../dbhelper");

const get_address_model = async (
  user_id,
  address_id,
  page = 1,
  limit = 10,
  search
) => {
  try {
    let query = `SELECT * ,COUNT(*) OVER() as count FROM address WHERE 1 = 1`; // Start with a base query
    const values = [];

    if (user_id) {
      query += ` AND user_id = $${values.length + 1}`;
      values.push(user_id);
    }
    if (address_id) {
      query += ` AND address_id = $${values.length + 1}`;
      values.push(address_id);
    }
    if (search) {
      query += ` AND (full_address ILIKE $${values.length + 1})`;
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
      message: "An unexpected error occurred while fetching product data.",
      data: [],
      count: 0,
    };
  }
};

module.exports = {
  get_address_model,
};
