const { update_user_model } = require("./update_user.model");
const { update_user_auth } = require("../validation_users");

const update_user = async (request, response, next) => {
  try {
    await update_user_auth.validateAsync(request.body);
    const {
      user_id,
      full_name,
      phone,
       is_active,
      is_deleted,
      profile_img
    } = request.body;

    const res = await update_user_model(
      user_id,
      full_name,
      phone,
      is_active,
      is_deleted,
      profile_img
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
  update_user,
};
