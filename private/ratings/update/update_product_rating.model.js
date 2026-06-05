const { pool } = require("../../../dbhelper");
const { current_epoch_time } = require("../../methods/current_epoch_time");

const update_product_rating_model = async (
  id,
  product_id,
  review_text,
  attachments,
  rate_by,
  starts
) => {
  try {
    const updated_at = current_epoch_time();
    const query = `UPDATE public.product_ratings
      SET product_id=$2, review_text=$3, attachments=$4, updated_at=$5, rate_by=$6, starts=$7
      WHERE id=$1 RETURNING *;`;
    const value = [
      id,
      product_id,
      review_text,
      attachments,
      updated_at,
      rate_by,
      starts
    ];
    const result = await pool.query(query, value);
    return result.rows.length > 0
      ? {
          success: true,
          message: "Rating updated",
          data: result.rows,
        }
      : { success: false, message: "Rating not found" };
  } catch (err) {
    console.error("Update Error:", err);
    return { success: false, error: "Update failed" };
  }
};

module.exports = { update_product_rating_model };
