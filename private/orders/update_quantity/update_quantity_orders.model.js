const { pool } = require("../../../dbhelper");

const update_orders_quantity_model = async (order_id, quantity) => {
  try {
    const query = `UPDATE orders
SET 
  product = json_build_array(
    (product->0)::jsonb || jsonb_build_object('product_quantity', $2::text)
  ),
  item_quantity = $3
WHERE order_id = $1 AND status != 'DELIVERED'
RETURNING *;`;
    const value = [order_id, String(quantity),quantity];
    const result = await pool.query(query, value);
    if (result.rows.length != 0) {
      return {
        success: true,
        message: `Order quantity updated Successfully!`,
        data: result.rows,
      };
    } else {
      return {
        success: false,
        message: "Order quantity not updated!",
        data: { order_id, quantity },
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
  update_orders_quantity_model,
};
