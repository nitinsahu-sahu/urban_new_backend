const {
  update_orders_quantity_model,
} = require("./update_quantity_orders.model");
const { update_orders_quantity_auth } = require("../validation_orders");

const update_orders_quantity_controller = async (request, response) => {
  try {
    await update_orders_quantity_auth.validateAsync(request.body);
    const { order_id, quantity } = request.body;

    const res = await update_orders_quantity_model(order_id, quantity);
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
    console.error("Error occurred", error);
    response.status(200).json({ success: false, error: error.message });
  }
};

module.exports = {
  update_orders_quantity_controller,
};
