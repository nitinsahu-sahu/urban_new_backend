const { create_offer_coupon_auth } = require("../validation_offer_coupon");
const { create_offer_coupon_model } = require("./create_offer_coupon.model");

const create_offer_coupon_controller = async (request, response, next) => {
  try {
    await create_offer_coupon_auth.validateAsync(request.body);
    const {
      code,
      description,
      term_and_condi,
      created_by,
      title,
      expire_date,
      one_time_use,
      publish_date,
      discount_type,
      discount_value,
    } = request.body;
    const res = await create_offer_coupon_model(
      code,
      description,
      term_and_condi,
      created_by,
      title,
      expire_date,
      one_time_use,
      publish_date,
      discount_type,
      discount_value
    );
    response.status(200).json({ ...res });
  } catch (error) {
    next(error);
    console.error("Create Controller Error:", error);
    response.status(200).json({ success: false, error: error.message });
  }
};
module.exports = {
  create_offer_coupon_controller,
};
