const { pool } = require("../../../dbhelper");

const update_orders_model = async (
  order_id,
  product,
  item_quantity,
  total_amount
) => {
  try {
    const query = `
      UPDATE public.orders 
      SET 
        product = $1,
        item_quantity = $2,
        total_amount = $3
      WHERE 
        order_id = $4 AND is_deleted = false
      RETURNING *;
    `;

    const values = [product, item_quantity, total_amount, order_id];

    const result = await pool.query(query, values);

    if (result.rows.length > 0) {
      return {
        success: true,
        message: "Order updated successfully!",
        data: result.rows[0],
      };
    } else {
      return {
        success: false,
        message: "Order not found or not updated.",
      };
    }
  } catch (err) {
    console.error("Error in update_orders_model:", err);
    return {
      success: false,
      error: "An error occurred while updating the order.",
    };
  }
};

module.exports = {
  update_orders_model,
};
