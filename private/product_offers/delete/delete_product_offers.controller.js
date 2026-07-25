const { delete_product_offers_model } = require("./delete_product_offers.model");

const delete_product_offers_controller = async (request, response, next) => {
  try {
    const { offer_id } = request.params;

    const res = await delete_product_offers_model(offer_id);
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
  delete_product_offers_controller,
};
