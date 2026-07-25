const { update_product_offers_model } = require("./update_product_offers.model");
const { update_product_offers_auth } = require("../validation_product_offers");

const update_product_offers_controller = async (request, response, next) => {
  try {
    await update_product_offers_auth.validateAsync(request.body);
    const {
      offer_id,
      product_id,
      on_buy,
      off_no,
      off_type,
      active,
      buy_now = 0,
      get_now = 0,
    } = request.body;

    const res = await update_product_offers_model(
      offer_id,
      product_id,
      on_buy,
      off_no,
      off_type,
      active,
      buy_now,
      get_now
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
  update_product_offers_controller,
};
