const { pool } = require("../../../dbhelper");
const { current_epoch_time } = require("../../methods/current_epoch_time");

const update_payments_model = async (
  payment_id,
  order_id,
  trx_id,
  amount,
  status,
  updated_by
) => {
  try {
    const updated_at = current_epoch_time();
    let query = `UPDATE public.payments SET updated_at = $1, updated_by = $2`;
    const values = [updated_at, updated_by];
    let paramIndex = 3;

    if (order_id !== undefined) {
      query += `, order_id = $${paramIndex}`;
      values.push(order_id);
      paramIndex++;
    }
    if (trx_id !== undefined) {
      query += `, trx_id = $${paramIndex}`;
      values.push(trx_id);
      paramIndex++;
    }
    if (amount !== undefined) {
      query += `, amount = $${paramIndex}`;
      values.push(amount);
      paramIndex++;
    }
    if (status !== undefined) {
      query += `, status = $${paramIndex}`;
      values.push(status);
      paramIndex++;
    }

    query += ` WHERE payment_id = $${paramIndex} RETURNING *;`;
    values.push(payment_id);

    const result = await pool.query(query, values);
    if (result.rows.length != 0) {
      return {
        success: true,
        message: "Payment updated Successfully!",
        data: result.rows,
      };
    } else {
      return {
        success: false,
        message: "Payment not updated!",
        data: {
          payment_id,
          order_id,
          amount,
          status,
          updated_by,
        },
      };
    }
  } catch (err) {
    console.error("Error in update_payments_model:", err);
    return {
      success: false,
      error: "An unexpected error occurred while processing the request.",
    };
  }
};

module.exports = {
  update_payments_model,
};
