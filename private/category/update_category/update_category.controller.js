const { update_category_model } = require("./update_category.model");
const { update_category_auth } = require("../validation_category");

const update_category_controller = async (request, response, next) => {
  try {
    await update_category_auth.validateAsync(request.body);
    const { category_id, category_name, category_image } = request.body;

    const res = await update_category_model(
      category_id,
      category_name,
      category_image
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
  update_category_controller,
};
