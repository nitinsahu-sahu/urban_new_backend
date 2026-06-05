const { create_user_model } = require("./create_user.model");
const { create_user_auth } = require("../validation_users");

const create_user = async (request, response, next) => {
  try {
    await create_user_auth.validateAsync(request.body);
    const { email, is_active, is_deleted, access_type } = request.body;

    const res = await create_user_model(
      email,
      is_active,
      is_deleted,
      access_type
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
  create_user,
};
