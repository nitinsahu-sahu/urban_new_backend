const { pool } = require("../../../dbhelper");

const delete_order_model = async (order_id) => {
  try {
    const query = `UPDATE public.orders
    SET is_deleted = CASE
        WHEN is_deleted = false THEN true
        WHEN is_deleted = true THEN false
        ELSE is_deleted
    END
    WHERE order_id = $1 RETURNING *;`;
    const value = [order_id];
    const result = await pool.query(query, value);
    if (result.rows.length != 0) {
      return {
        success: true,
        message: `order ${
          result.rows[0].is_deleted ? "deleted" : "Undeleted"
        } successfully.`,
        data: result.rows,
      };
    } else {
      return {
        success: false,
        message: "order not updated!",
        data: { order_id },
      };
    }
  } catch (err) {
    console.error("Error in createUserModel:", err);
    return {
      success: false,
      error: "An unexpected error occurred while processing the request.",
    };
  }
};

module.exports = {
  delete_order_model,
};
