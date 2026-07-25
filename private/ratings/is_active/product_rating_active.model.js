const { pool } = require("../../../dbhelper");

const product_rating_active_model = async (id, is_active) => {
  try {
    const updated_at = Math.floor(Date.now() / 1000); // current epoch time in seconds
    const query = `
      UPDATE public.product_ratings
      SET is_active = $2, updated_at = $3
      WHERE id = $1 AND is_deleted = false
      RETURNING *;
    `;
    const values = [id, is_active, updated_at];
    const result = await pool.query(query, values);

    if (result.rows.length > 0) {
      return { success: true, message: "Rating status updated successfully", data: result.rows[0] };
    } else {
      return { success: false, message: "Rating not found or already deleted" };
    }
  } catch (err) {
    console.error("Patch Error:", err);
    return { success: false, error: "Failed to update rating status" };
  }
};

module.exports = { product_rating_active_model };
