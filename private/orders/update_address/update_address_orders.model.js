const { pool } = require("../../../dbhelper");

const update_orders_address_model = async (order_id, address_id) => {
  try {
    const query = `UPDATE public.orders
    SET address_id = $2 
    WHERE order_id = $1 AND status != 'DELIVERED' RETURNING *;`;
    const value = [order_id, address_id];
    const result = await pool.query(query, value);
    if (result.rows.length != 0) {
      return {
        success: true,
        message: `Order address updated Successfully!`,
        data: result.rows,
      };
    } else {
      return {
        success: false,
        message: "Order address not updated!",
        data: { order_id, address_id },
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
  update_orders_address_model,
};
