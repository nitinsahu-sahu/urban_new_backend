const {
  update_orders_address_model,
} = require("./update_address_orders.model");
const { update_orders_address_auth } = require("../validation_orders");

const update_orders_address_controller = async (request, response) => {
  try {
    await update_orders_address_auth.validateAsync(request.body);
    const { order_id, address_id } = request.body;

    const res = await update_orders_address_model(order_id, address_id);
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
  update_orders_address_controller,
};
