const { pool } = require("../../../dbhelper");

const get_product_offers_model = async (
  offer_id,
  product_id,
  active,
  page = 1,
  limit = 10,
  search
) => {
  try {
    let query = `SELECT * ,COUNT(*) OVER() as count FROM product_offers WHERE 1 = 1`; // Start with a base query
    const values = [];

    if (offer_id) {
      query += ` AND offer_id = $${values.length + 1}`;
      values.push(offer_id);
    }
    if (product_id) {
      query += ` AND product_id = $${values.length + 1}`;
      values.push(product_id);
    }
    if (active !== undefined) {
      query += ` AND active = $${values.length + 1}`;
      values.push(active);
    }
    if (search) {
      query += ` AND (off_type ILIKE $${values.length + 1})`;
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
    return {
      success: false,
      message: "An unexpected error occurred while fetching product offers data.",
      data: [],
      count: 0,
    };
  }
};

module.exports = {
  get_product_offers_model,
};
