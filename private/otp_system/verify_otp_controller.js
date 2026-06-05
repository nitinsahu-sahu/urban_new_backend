const { verify_otp_model } = require("./verify_otp.model");
const {verify_otp_auth} = require("./otp.validation")
const verify_otp_controller = async (request, response) => {
  try {
    await verify_otp_auth.validateAsync(request.body);
    const { otp, email, access_type } = request.body;
    const result = await verify_otp_model(otp, email, access_type);
    if (result.success) {
      
      response.status(200).json({
        ...result,
      });
    } else {
      response.status(200).json({
        ...result,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = { verify_otp_controller };
