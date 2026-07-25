const { delete_category_model } = require("./delete_category.model");

const delete_category_controller = async (request, response, next) => {
  try {
    const category_id = request.params.id;
    const res = await delete_category_model(category_id);
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
  delete_category_controller,
};
