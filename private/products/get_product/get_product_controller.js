const { get_product_model } = require("./get_product_model");

const get_product_controller = async (request, response) => {
  try {
    const {
      product_id,
      category_id,
      expire_date,
      created_at,
      brand_id,
      is_active,
      search,
      page,
      limit,
      is_active_all,
      user_id,
    } = request.query;
    const res = await get_product_model(
      product_id,
      category_id,
      expire_date,
      created_at,
      brand_id,
      is_active,
      search,
      page,
      limit,
      is_active_all,
      user_id
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
  get_product_controller,
};
