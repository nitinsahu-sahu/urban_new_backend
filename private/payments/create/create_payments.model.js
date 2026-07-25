const { pool } = require("../../../dbhelper");
const { random_number } = require("../../methods/random_number");
const { current_epoch_time } = require("../../methods/current_epoch_time");

const create_payments_model = async (
  order_id,
  trx_id,
  amount,
  status,
  created_by
) => {
  try {
    const payment_id = random_number();
    const created_at = current_epoch_time();
    const query = `INSERT INTO public.payments(
      order_id, payment_id, trx_id, created_at, updated_at, created_by, updated_by, amount, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;`;
    const value = [
      order_id,
      payment_id,
      trx_id,
      created_at,
      created_at,
      created_by,
      created_by,
      amount,
      status,
    ];
    const result = await pool.query(query, value);
    if (result.rows.length != 0) {
      return {
        success: true,
        message: "Payment Created Successfully!",
        data: result.rows,
      };
    } else {
      return {
        success: false,
        message: "Payment not Created!",
        data: {
          order_id,
          payment_id,
          amount,
          status,
          created_by,
        },
      };
    }
  } catch (err) {
    console.error("Error in create_payments_model:", err);
    return {
      success: false,
      error: "An unexpected error occurred while processing the request.",
    };
  }
};

module.exports = {
  create_payments_model,
};
