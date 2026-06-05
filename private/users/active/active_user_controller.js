const { active_user_model } = require("./active_user.model");
const { active_user_auth } = require("../validation_users");

const active_user = async (request, response) => {
  try {
    await active_user_auth.validateAsync(request.body);
    const { user_id, is_active } = request.body;

    const res = await active_user_model(user_id, is_active);
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
  active_user,
};
