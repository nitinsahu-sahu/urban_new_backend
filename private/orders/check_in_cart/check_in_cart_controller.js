const { check_in_cart_model } = require("./check_in_cart_model");

const check_in_cart_controller = async (request, response) => {
  try {
    const { user_id, product_id } = request.query;

    if (!user_id || !product_id) {
      return response.status(400).json({
        success: false,
        message: "user_id and product_id are required.",
      });
    }

    const res = await check_in_cart_model(user_id, product_id);

    response.status(200).json(res);
  } catch (error) {
    console.error("Error occurred", error);
    response.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  check_in_cart_controller,
};
