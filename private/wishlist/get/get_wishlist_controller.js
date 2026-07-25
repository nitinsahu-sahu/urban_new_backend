const { get_wishlist_model } = require("./get_wishlist.model");

const get_wishlist_controller = async (request, response, next) => {
  try {
    const { user_id, search = "", page = 1, limit = 10 } = request.query;

    const res = await get_wishlist_model(user_id, search, page, limit);

    response.status(200).json(res);
  } catch (error) {
    console.error("Error in get_wishlist_controller:", error);
    response.status(200).json({ success: false, error: error.message });
  }
};

module.exports = {
  get_wishlist_controller,
};
