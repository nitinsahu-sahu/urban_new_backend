const { pool } = require("../../../dbhelper");

const check_in_cart_model = async (user_id, product_id) => {
  try {
    const query = `
      SELECT order_id, item_quantity
      FROM orders
      WHERE user_id = $1
        AND status = 'IN_CART'
        AND is_deleted = false
        AND EXISTS (
          SELECT 1
          FROM json_array_elements(product) AS prod
          WHERE prod ->> 'product_id' = $2
        )
      LIMIT 1
    `;

    const result = await pool.query(query, [user_id, product_id]);

    if (result.rows.length > 0) {
      return {
        success: true,
        message: "Product is already in cart.",
        in_cart: true,
        order_id: result.rows[0].order_id,
        item_quantity: result.rows[0].item_quantity,
      };
    } else {
      return {
        success: true,
        message: "Product is not in cart.",
        in_cart: false,
        order_id: null,
        item_quantity: null,
      };
    }
  } catch (error) {
    console.error("Model error:", error);
    return {
      success: false,
      message: "An error occurred while checking the cart.",
      error: error.message,
    };
  }
};

module.exports = {
  check_in_cart_model,
};
