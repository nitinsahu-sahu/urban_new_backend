const { delete_offer_coupon_model } = require("./delete_offer_coupon.model");

const delete_offer_coupon_controller = async (request, response, next) => {
  try {
    const id = request.params.id;
    const res = await delete_offer_coupon_model(id);
    response.status(200).json({ ...res });
  } catch (error) {
    next(error);
    console.error("Delete Controller Error:", error);
    response.status(200).json({ success: false, error: error.message });
  }
};
module.exports = {
  delete_offer_coupon_controller,
};