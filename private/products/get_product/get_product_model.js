const { pool } = require("../../../dbhelper");

const get_product_model = async (
  product_id,
  category_id,
  expire_date,
  created_at,
  brand_id,
  is_active,
  search,
  page = 1,
  limit = 10,
  is_active_all = "YES",
  user_id
) => {
  try {
    console.log(search)
    let query = `SELECT 
      p.*,
      COUNT(*) OVER() AS count,
      CAST(p.product_sale_price AS numeric(10,2)) AS product_sale_price,
      CAST(p.product_actual_price AS numeric(10,2)) AS product_actual_price,
      JSON_BUILD_OBJECT('brand_id', b.brand_id, 'brand_name', b.brand_name) AS brand_info,
      JSON_BUILD_OBJECT('category_id', c.category_id, 'category_name', c.category_name) AS category_info,
      COALESCE(w.is_wishlist, false) AS is_wishlist,
      COALESCE(r.rating_breakdown, '{}'::json) AS rating_breakdown,
      COALESCE(r.total_reviews, 0) AS total_reviews,
      COALESCE(r.average_rating, 0) AS average_rating
    FROM 
      products p
    LEFT JOIN brand b ON p.brand_id = b.brand_id
    LEFT JOIN category c ON p.category_id = c.category_id`;

    // Handle wishlist join conditionally
    if (user_id) {
      query += ` LEFT JOIN wishlist w ON p.product_id = w.product_id AND w.user_id = $1`;
    } else {
      query += ` LEFT JOIN wishlist w ON FALSE`; // This will always return NULL for wishlist
    }

    query += ` LEFT JOIN (
      SELECT 
        product_id,
        JSON_OBJECT_AGG(stars, count) AS rating_breakdown,
        SUM(count) AS total_reviews,
        ROUND(SUM(stars * count)::numeric / NULLIF(SUM(count), 0), 1) AS average_rating
      FROM (
        SELECT 
          product_id,
          starts AS stars,
          COUNT(*) AS count
        FROM product_ratings
        WHERE is_deleted = false AND is_active = true
        GROUP BY product_id, starts
      ) AS grouped
      GROUP BY product_id
    ) r ON p.product_id = r.product_id
    WHERE 1 = 1`;

    const values = [];
    let paramIndex = 0;

    // Add user_id first if it exists
    if (user_id) {
      paramIndex++;
      values.push(user_id);
    }

    if (product_id) {
      paramIndex++;
      query += ` AND p.product_id = $${paramIndex}`;
      values.push(product_id);
    }
    
    if (category_id) {
      paramIndex++;
      query += ` AND p.category_id = $${paramIndex}`;
      values.push(category_id);
    }
    
    if (expire_date) {
      paramIndex++;
      query += ` AND p.expire_date = $${paramIndex}`;
      values.push(expire_date);
    }
    
    if (created_at) {
      paramIndex++;
      query += ` AND p.created_at = $${paramIndex}`;
      values.push(created_at);
    }
    
    if (brand_id) {
      paramIndex++;
      query += ` AND p.brand_id = $${paramIndex}`;
      values.push(brand_id);
    }
    
    if (is_active !== undefined) {
      paramIndex++;
      query += ` AND p.is_active = $${paramIndex}`;
      values.push(is_active);
    }

    if (is_active_all === "YES") {
      query += ` AND p.is_active = true`;
    } else if (is_active_all === "NO") {
      query += ` AND p.is_active = false`;
    }

    if (search) {
      const searchParam1 = ++paramIndex;
      const searchParam2 = ++paramIndex;
      const searchParam3 = ++paramIndex;
      const searchParam4 = ++paramIndex;
      
      query += ` AND (
        p.product_name ILIKE $${searchParam1} OR
        p.product_disc ILIKE $${searchParam2} OR
        b.brand_name ILIKE $${searchParam3} OR
        c.category_name ILIKE $${searchParam4}
      )`;
      
      values.push(
        `%${search}%`,
        `%${search}%`,
        `%${search}%`,
        `%${search}%`
      );
    }

    if (limit && page) {
      const limitParam = ++paramIndex;
      const offsetParam = ++paramIndex;
      
      query += ` ORDER BY p.created_at DESC LIMIT $${limitParam} OFFSET $${offsetParam}`;
      values.push(limit, (page - 1) * limit);
    }

    console.log('Final query:', query);
    console.log('Values:', values);

    const result = await pool.query(query, values);
    const count = result?.rows[0]?.count;

    const data = result.rows.map((row) => ({
      ...row,
      product_variants: row.product_variants || [],
      rating_breakdown: {
        1: row.rating_breakdown?.["1"] || 0,
        2: row.rating_breakdown?.["2"] || 0,
        3: row.rating_breakdown?.["3"] || 0,
        4: row.rating_breakdown?.["4"] || 0,
        5: row.rating_breakdown?.["5"] || 0,
      },
      total_reviews: Number(row.total_reviews) || 0,
      average_rating: Number(row.average_rating) || 0,
      is_wishlist: row.is_wishlist === true,
    }));

    return {
      success: true,
      message:
        data.length === 0
          ? "No matching records found."
          : "Data retrieved successfully.",
      data,
      count,
      page,
      limit,
    };
  } catch (error) {
    console.error("Error in get_product_model:", error);
    return {
      success: false,
      message: "An unexpected error occurred while fetching product data.",
      data: [],
      count: 0,
    };
  }
};

module.exports = {
  get_product_model,
};