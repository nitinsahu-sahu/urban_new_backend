const { verify_phone_otp_model } = require("./verify_phone_otp_model");
const { verify_phone_otp_auth } = require("../../validation_users");

const verify_phone_otp_controller = async (req, res, next) => {
  try {
    await verify_phone_otp_auth.validateAsync(req.body);

    const { verificationId, otp } = req.body;

    const result = await verify_phone_otp_model(
      verificationId,
      otp
    );

    res.status(result.success ? 200 : result.status || 400).json(result);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  verify_phone_otp_controller,
};
