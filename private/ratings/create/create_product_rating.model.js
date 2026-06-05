const { pool } = require("../../../dbhelper");
const { random_number } = require("../../methods/random_number");
const { current_epoch_time } = require("../../methods/current_epoch_time");

const create_product_rating_model = async (
  product_id,
  review_text,
  attachments,
  rate_by,
  starts
) => {
  try {
    const id = random_number();
    const created_at = current_epoch_time();
    const query = `INSERT INTO public.product_ratings (
      id, product_id, review_text, attachments, created_at, is_deleted, is_active, rate_by, starts)
      VALUES ($1, $2, $3, $4, $5, false, true, $6, $7) RETURNING *;`;
    const value = [
      id,
      product_id,
      review_text,
      attachments,
      created_at,
      rate_by,
      starts,
    ];
    const result = await pool.query(query, value);
    return { success: true, message: "Rating created", data: result.rows };
  } catch (err) {
    console.error("Error in create_product_rating_model:", err);
    if (err.code === "23505") {
      return {
        success: false,
        message: "You have already rated this product",
        error: "rating already exists",
      };
    }
    return { success: false, error: "Unexpected error occurred" };
  }
};

module.exports = { create_product_rating_model };
