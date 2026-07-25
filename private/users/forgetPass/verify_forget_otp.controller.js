const { verify_forget_otp_model } = require("./verify_forget_otp.model");
const { verify_forget_otp_auth } = require("../validation_users");

const verify_forget_otp_controller = async (request, response) => {
  try {
    await verify_forget_otp_auth.validateAsync(request.body);
    const { email, otp } = request.body;

    const result = await verify_forget_otp_model(email, otp);
    if (result.success) {
      response.status(200).json({
        success: true,
        message: "OTP verified successfully",
      });
    } else {
      response.status(200).json({
        success: false,
        message: result.message,
      });
    }
  } catch (error) {
    console.error("Error in verify forget OTP:", error);
    response.status(200).json({
      success: false,
      message: "An error occurred while processing your request",
    });
  }
};

module.exports = {
  verify_forget_otp_controller,
};
