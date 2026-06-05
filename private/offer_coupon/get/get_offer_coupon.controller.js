const { get_offer_coupon_model } = require("./get_offer_coupon.model");

const get_offer_coupon_controller = async (request, response, next) => {
  try {
    const res = await get_offer_coupon_model();
    response.status(200).json({ ...res });
  } catch (error) {
    next(error);
    console.error("Get Controller Error:", error);
    response.status(200).json({ success: false, error: error.message });
  }
};
module.exports = {
  get_offer_coupon_controller,
};