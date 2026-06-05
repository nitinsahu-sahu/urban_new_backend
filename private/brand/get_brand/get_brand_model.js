const { pool } = require("../../../dbhelper");

const get_brand_model = async (
  brand_id,
  search,
  page = 1,
  limit = 10,
  category_id
) => {
  try {
    let query = `
      SELECT 
        brand.*, 
        category.category_name, 
        COUNT(*) OVER() as count,
        COALESCE(product_counts.product_count, 0) AS product_count,
        ROUND(COALESCE(brand_ratings.average_rating, 0)::numeric, 1) AS average_rating
      FROM brand 
      LEFT JOIN category ON brand.category_id = category.category_id
      LEFT JOIN (
        SELECT brand_id, COUNT(*) AS product_count
        FROM products
        GROUP BY brand_id
      ) AS product_counts ON brand.brand_id = product_counts.brand_id
      LEFT JOIN (
        SELECT 
          p.brand_id,
          SUM(r.starts)::float / NULLIF(COUNT(r.*), 0) AS average_rating
        FROM products p
        INNER JOIN product_ratings r 
          ON p.product_id = r.product_id 
          AND r.is_deleted = false 
          AND r.is_active = true
        GROUP BY p.brand_id
      ) AS brand_ratings ON brand.brand_id = brand_ratings.brand_id
      WHERE 1 = 1
    `;

    const values = [];

    if (brand_id) {
      query += ` AND brand.brand_id = $${values.length + 1}`;
      values.push(brand_id);
    }

    if (category_id) {
      query += ` AND brand.category_id = $${values.length + 1}`;
      values.push(category_id);
    }

    if (search) {
      query += ` AND (brand.brand_name ILIKE $${values.length + 1})`;
      values.push(`%${search}%`);
    }

    if (limit && page) {
      query += ` ORDER BY brand.created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
      values.push(limit);
      values.push((page - 1) * limit);
    }

    const result = await pool.query(query, values);
    const count = result?.rows[0]?.count || 0;

    return {
      success: true,
      message: result.rows.length ? "Data retrieved successfully." : "No matching records found.",
      count,
      page,
      limit,
      data: result.rows,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "An unexpected error occurred while fetching brand data.",
      data: [],
      count: 0,
    };
  }
};

module.exports = {
  get_brand_model,
};
