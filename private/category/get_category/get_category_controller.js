const { get_category_model } = require("./get_category_model");

const get_category_controller = async (request, response) => {
  try {
    const {
      category_id,
      search,
      page,
      limit,
    } = request.query;
    const res = await get_category_model(
      category_id,
      search,
      page,
      limit,
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
  get_category_controller,
};
