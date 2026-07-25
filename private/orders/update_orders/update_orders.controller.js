const { update_orders_model } = require("./update_orders.model");
const { update_orders_auth } = require("../validation_orders");

const update_orders_controller = async (request, response, next) => {
  try {
    await update_orders_auth.validateAsync(request.body);

    const {
      order_id,
      product,
      item_quantity,
      total_amount,
    } = request.body;

    const res = await update_orders_model(
      order_id,
      product,
      item_quantity,
      total_amount
    );

    response.status(200).json(res);
  } catch (error) {
    console.error("Error in update_orders_controller:", error);
    response.status(200).json({ success: false, error: error.message });
  }
};

module.exports = {
  update_orders_controller,
};
