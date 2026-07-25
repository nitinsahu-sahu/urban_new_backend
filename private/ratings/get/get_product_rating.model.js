const { pool } = require("../../../dbhelper");

const get_product_rating_model = async (
  page = 1,
  limit = 10,
  product_id = null
) => {
  try {
    const offset = (page - 1) * limit;

    const baseQuery = `
      SELECT 
        pr.*, 
        u.full_name, 
        u.profile_img, 
        COUNT(*) OVER() AS total_count
      FROM public.product_ratings pr
      LEFT JOIN public.users u ON pr.rate_by = u.user_id
      WHERE pr.is_deleted = false
      ${product_id ? "AND pr.product_id = $1" : ""}
      ORDER BY pr.created_at DESC
      LIMIT $${product_id ? 2 : 1} OFFSET $${product_id ? 3 : 2};
    `;

    const values = product_id ? [product_id, limit, offset] : [limit, offset];

    const result = await pool.query(baseQuery, values);

    const total_count =
      result.rows.length > 0 ? parseInt(result.rows[0].total_count, 10) : 0;

    return {
      success: true,
      message: "Ratings fetched successfully",
      total_count,
      page,
      limit,
      total_pages: Math.ceil(total_count / limit),
      data: result.rows,
    };
  } catch (err) {
    console.error("Get Error:", err);
    return { success: false, error: "Failed to fetch ratings" };
  }
};

module.exports = { get_product_rating_model };
