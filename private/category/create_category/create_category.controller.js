const { create_category_model } = require("./create_category.model");
const { create_category_auth } = require("../validation_category");

const create_category_controller = async (request, response, next) => {
  try {
    await create_category_auth.validateAsync(request.body);
    const { category_name, category_image } = request.body;

    const res = await create_category_model(category_name, category_image);
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
  create_category_controller,
};
