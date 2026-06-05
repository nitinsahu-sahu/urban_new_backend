const { reset_password_model } = require("./reset_password.model");
const { reset_password_auth } = require("../validation_users");

const reset_password_controller = async (request, response) => {
  try {
    await reset_password_auth.validateAsync(request.body);
    const { email, otp, new_password } = request.body;

    const result = await reset_password_model(email, otp, new_password);
    if (result.success) {
      response.status(200).json({
        success: true,
        message: "Password reset successfully",
      });
    } else {
      response.status(200).json({
        success: false,
        message: result.message,
      });
    }
  } catch (error) {
    console.error("Error in reset password:", error);
    response.status(200).json({
      success: false,
      message: "An error occurred while processing your request",
    });
  }
};

module.exports = {
  reset_password_controller,
};
