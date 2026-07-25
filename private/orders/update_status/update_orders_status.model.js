const { pool } = require("../../../dbhelper");

const update_orders_status_model = async (order_id, status, address_id) => {
  try {
    const query = `UPDATE public.orders
    SET status = $2 , address_id = $3
    WHERE order_id = $1 AND status != 'DELIVERED' RETURNING *;`;
    const value = [order_id, status, address_id];
    const result = await pool.query(query, value);
    if (result.rows.length != 0) {
      return {
        success: true,
        message: `Order status updated Successfully!`,
        data: result.rows,
      };
    } else {
      return {
        success: false,
        message: "Order status not updated!",
        data: { order_id, status },
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
  update_orders_status_model,
};
