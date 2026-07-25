const { delete_user_model } = require("./delete_user.model");

const delete_user = async (request, response, next) => {
  try {
    const user_id = request.params.id;
    const res = await delete_user_model(user_id);
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
  delete_user,
};
