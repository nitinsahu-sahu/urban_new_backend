const { update_offer_coupon_auth } = require("../validation_offer_coupon");
const { update_offer_coupon_model } = require("./update_offer_coupon.model");

const update_offer_coupon_controller = async (request, response, next) => {
  try {
    await update_offer_coupon_auth.validateAsync(request.body);
    const {
      id,
      code,
      description,
      term_and_condi,
      title,
      expire_date,
      one_time_use,
      publish_date,
      discount_type,
      discount_value,
      updated_by,
    } = request.body;
    const res = await update_offer_coupon_model(
      id,
      code,
      description,
      term_and_condi,
      title,
      expire_date,
      one_time_use,
      publish_date,
      discount_type,
      discount_value,
      updated_by
    );
    response.status(200).json({ ...res });
  } catch (error) {
    next(error);
    console.error("Update Controller Error:", error);
    response.status(200).json({ success: false, error: error.message });
  }
};
module.exports = {
  update_offer_coupon_controller,
};
