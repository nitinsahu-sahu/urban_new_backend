const { delete_order_model } = require("./delete_order.model");

const delete_order_controller = async (request, response, next) => {
  try {
    const order_id = request.params.id;
    const res = await delete_order_model(order_id);
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
  delete_order_controller,
};
