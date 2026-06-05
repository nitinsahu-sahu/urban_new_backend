const { login_user_model } = require("./newLogin_model");
const { login_user_auth } = require("../validation_users");

const login_user_controller = async (request, response, next) => {
  try {
    await login_user_auth.validateAsync(request.body);
    const { email, password,access_type } = request.body;

    const res = await login_user_model(email, password,access_type);
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
  login_user_controller,
};
