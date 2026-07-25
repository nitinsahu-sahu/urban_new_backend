const { pool } = require("../../../dbhelper");

const get_spacial_offers_model = async (page = 1, limit = 10) => {
  try {
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `
      SELECT 
        so.*, 
        CASE WHEN p.product_id IS NOT NULL THEN to_jsonb(p) ELSE NULL END AS product_info,
        CASE WHEN c.category_id IS NOT NULL THEN to_jsonb(c) ELSE NULL END AS category_info,
        CASE WHEN b.brand_id IS NOT NULL THEN to_jsonb(b) ELSE NULL END AS brand_info,
        COUNT(*) OVER() AS total_count
      FROM public.spacial_offers so
      LEFT JOIN public.products p ON so.product_id = p.product_id
      LEFT JOIN public.category c ON so.category_id = c.category_id
      LEFT JOIN public.brand b ON so.brand_id = b.brand_id
      WHERE so.is_deleted = false
      ORDER BY so.created_at DESC
      LIMIT $1 OFFSET $2;
      `,
      [limit, offset]
    );

    return {
      success: true,
      message: "Spacial offers retrieved successfully",
      total_count: result.rows[0] ? parseInt(result.rows[0].total_count) : 0,
      current_page: page,
      per_page: limit,
      data: result.rows,
    };
  } catch (error) {
    console.error("Get Error:", error);
    return { success: false, error: error.message };
  }
};

module.exports = { get_spacial_offers_model };
