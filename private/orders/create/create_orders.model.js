const { pool } = require("../../../dbhelper");
const { random_number } = require("../../methods/random_number");
const { current_epoch_time } = require("../../methods/current_epoch_time");

const create_orders_model = async (
  user_id,
  item_quantity,
  status,
  total_amount,
  address_id,
  product
) => {
  try {
    const order_id = random_number();
    const created_at = current_epoch_time();
    const query = `INSERT INTO public.orders(
      order_id, user_id, item_quantity, status, created_at, total_amount, address_id, product)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;`;
    const value = [
      order_id,
      user_id,
      item_quantity,
      status,
      created_at,
      total_amount,
      address_id,
      JSON.stringify(product),
    ];
    const result = await pool.query(query, value);
    if (result.rows.length != 0) {
      return {
        success: true,
        message: "Orders Created Successfully!",
        data: result.rows,
      };
    } else {
      return {
        success: false,
        message: "Orders not Created!",
        data: {
          user_id,
          item_quantity,
          status,
          total_amount,
          address_id,
          product,
        },
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
  create_orders_model,
};
