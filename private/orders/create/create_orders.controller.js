const { pool } = require("../../../dbhelper");
const { create_orders_model } = require("./create_orders.model");
const { create_orders_auth } = require("../validation_orders");

const create_orders_controller = async (request, response, next) => {

  try {
    await create_orders_auth.validateAsync(request.body);
    const {
      user_id,
      item_quantity,
      status,
      total_amount,
      address_id,
      product,
    } = request.body;

    const productIds = product.map((p) => p.product_id);
    const outOfStockQuery = `SELECT product_id FROM public.products WHERE product_id = ANY($1::text[]) AND is_out_of_stock = true`;
    const outOfStockResult = await pool.query(outOfStockQuery, [productIds]);
    if (outOfStockResult.rows.length > 0) {
      return response.status(400).json({
        success: false,
        message: "This product is currently out of stock.",
      });
    }

    const res = await create_orders_model(
      user_id,
      item_quantity,
      status,
      total_amount,
      address_id,
      product
    );
    if (res.success) {
      response.status(200).json({
        ...res,
      });
    } else {
      response.status(200).json({
        ...res,
      });
    }
  } catch (error) {
    response.status(400).json({ success: false, error: error.message });
  }
};

module.exports = {
  create_orders_controller,
};
