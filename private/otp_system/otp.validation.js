const Joi = require("joi");

const verify_otp_auth = Joi.object({
  email: Joi.string().email(),
  access_type: Joi.string().valid("WEB", "APP"),
  otp: Joi.string()
    .pattern(/^[0-9]{4}$/)
    .required(),
});
module.exports = {
  verify_otp_auth,
};
