const { get_product_offers_model } = require("./get_product_offers.model");

const get_product_offers_controller = async (request, response) => {
  try {
    const { offer_id, product_id, active, page, limit, search } = request.query;
    const res = await get_product_offers_model(
      offer_id,
      product_id,
      active,
      page,
      limit,
      search
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
    console.error("Error occurred", error);
    response.status(200).json({ success: false, error: error.message });
  }
};

module.exports = {
  get_product_offers_controller,
};
