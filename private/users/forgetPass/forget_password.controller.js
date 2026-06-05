const { forget_password_model } = require("./forget_password.model");
const { forget_password_auth } = require("../validation_users");

const forget_password_controller = async (request, response) => {
  try {
    await forget_password_auth.validateAsync(request.body);
    const { email } = request.body;

    const result = await forget_password_model(email);
    if (result.success) {
      response.status(200).json({
        success: true,
        message: "OTP sent to your email successfully",
      });
    } else {
      response.status(200).json({
        success: false,
        message: result.message,
      });
    }
  } catch (error) {
    console.error("Error in forget password:", error);
    response.status(200).json({
      success: false,
      message: "An error occurred while processing your request",
    });
  }
};

module.exports = {
  forget_password_controller,
};
