const { pool } = require("../../../dbhelper");

const get_wishlist_model = async (
  user_id,
  search = "",
  page = 1,
  limit = 10
) => {
  try {
    const offset = (page - 1) * limit;
    const values = [];
    let whereClause = `WHERE w.is_wishlist = true`;

    // Dynamic filters
    if (user_id) {
      values.push(user_id);
      whereClause += ` AND w.user_id = $${values.length}`;
    }

    if (search) {
      values.push(`%${search}%`);
      whereClause += ` AND p.product_name ILIKE $${values.length}`;
    }

    // Add pagination params
    values.push(limit);  // $N-1
    values.push(offset); // $N

    const query = `
      SELECT 
        to_json(p) AS product_info,
        w.created_at,w.is_wishlist,
        COUNT(*) OVER() AS total_count
      FROM wishlist w
      LEFT JOIN products p ON w.product_id = p.product_id
      ${whereClause}
      ORDER BY w.created_at DESC
      LIMIT $${values.length - 1} OFFSET $${values.length};
    `;

    const result = await pool.query(query, values);

    return {
      success: true,
      message: "Wishlist fetched successfully",
      page: parseInt(page),
      limit: parseInt(limit),
      total: result?.rows[0]?.total_count ?? 0,
      data: result.rows,
    };
  } catch (err) {
    console.error("Error in get_wishlist_model:", err);
    return {
      success: false,
      error: "An unexpected error occurred while fetching the wishlist.",
    };
  }
};

module.exports = {
  get_wishlist_model,
};
