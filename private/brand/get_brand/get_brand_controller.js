const { get_brand_model } = require("./get_brand_model");

const get_brand_controller = async (request, response) => {
  try {
    const { brand_id, page, limit, search, category_id } = request.query;
    const res = await get_brand_model(
      brand_id,
      search,
      page,
      limit,
      category_id
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
  get_brand_controller,
};
