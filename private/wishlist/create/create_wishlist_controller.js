const { toggle_wishlist_model } = require("./create_wishlist.model");
const { toggle_wishlist_auth } = require("../validation_wishlist");

const toggle_wishlist_controller = async (request, response, next) => {
  try {
    await toggle_wishlist_auth.validateAsync(request.body);

    const { user_id, product_id } = request.body;

    const res = await toggle_wishlist_model(user_id, product_id);

    response.status(200).json(res);
  } catch (error) {
    console.error("Error occurred in toggle_wishlist_controller:", error);
    response.status(200).json({ success: false, error: error.message });
  }
};

module.exports = {
  toggle_wishlist_controller,
};
