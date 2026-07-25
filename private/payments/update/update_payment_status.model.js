const { pool } = require("../../../dbhelper");
const { current_epoch_time } = require("../../methods/current_epoch_time");

const update_payment_status_model = async (
  payment_id,
  status,
  updated_by
) => {
  try {
    const updated_at = current_epoch_time();
    const query = `UPDATE public.payments SET status = $1, updated_at = $2, updated_by = $3 WHERE payment_id = $4 RETURNING *;`;
    const value = [status, updated_at, updated_by, payment_id];
    const result = await pool.query(query, value);
    if (result.rows.length != 0) {
      return {
        success: true,
        message: "Payment status updated Successfully!",
        data: result.rows,
      };
    } else {
      return {
        success: false,
        message: "Payment not found or status not updated!",
        data: {
          payment_id,
          status,
          updated_by,
        },
      };
    }
  } catch (err) {
    console.error("Error in update_payment_status_model:", err);
    return {
      success: false,
      error: "An unexpected error occurred while processing the request.",
    };
  }
};

module.exports = {
  update_payment_status_model,
};
