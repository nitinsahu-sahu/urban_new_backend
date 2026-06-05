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
    next(error);
    console.error("Error occurred", error);
    response.status(200).json({ success: false, error: error.message });
  }
};

module.exports = {
  create_orders_controller,
};
