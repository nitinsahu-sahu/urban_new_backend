const { signup_user_model } = require("./signup_model");
const { signup_user_auth } = require("../validation_users");

const signup_user_controller = async (request, response, next) => {
  try {
    await signup_user_auth.validateAsync(request.body);
    const { full_name, email, password } = request.body;

    const res = await signup_user_model(full_name, email, password);
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
  signup_user_controller,
};
