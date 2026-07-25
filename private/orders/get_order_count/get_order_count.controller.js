const { get_orders_count_model } = require("./get_order_count.model");

const get_orders_count_controller = async (request, response) => {
  try {
    const { user_id } = request.query;
    const res = await get_orders_count_model(user_id);
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
  get_orders_count_controller,
};
