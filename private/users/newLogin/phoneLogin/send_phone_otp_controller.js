const { send_phone_otp_model } = require("./send_phone_otp_model");
const { send_phone_otp_auth } = require("../../validation_users");

const send_phone_otp_controller = async (request, response, next) => {
  try {
    await send_phone_otp_auth.validateAsync(request.body);

    const { phone } = request.body;

    const result = await send_phone_otp_model(phone);

    response.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  send_phone_otp_controller,
};
