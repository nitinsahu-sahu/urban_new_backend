const { pool } = require("../../../dbhelper");

const delete_product_rating_model = async (id) => {
  try {
    const query = `UPDATE public.product_ratings SET is_deleted = true WHERE id = $1 RETURNING *;`;
    const result = await pool.query(query, [id]);
    return { success: true, message: "Rating deleted", data: result.rows };
  } catch (err) {
    return { success: false, error: "Delete failed" };
  }
};

module.exports = { delete_product_rating_model };