const { pool } = require("../../../dbhelper");

const delete_payments_model = async (payment_id) => {
  try {
    const query = `DELETE FROM public.payments WHERE payment_id = $1 RETURNING *;`;
    const value = [payment_id];
    const result = await pool.query(query, value);
    if (result.rows.length != 0) {
      return {
        success: true,
        message: "Payment deleted Successfully!",
        data: result.rows,
      };
    } else {
      return {
        success: false,
        message: "Payment not found or not deleted!",
        data: {
          payment_id,
        },
      };
    }
  } catch (err) {
    console.error("Error in delete_payments_model:", err);
    return {
      success: false,
      error: "An unexpected error occurred while processing the request.",
    };
  }
};

module.exports = {
  delete_payments_model,
};
