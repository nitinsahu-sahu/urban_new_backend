const Joi = require("joi");

const create_user_auth = Joi.object({
  email: Joi.string().email(),
  is_active: Joi.boolean(),
  is_deleted: Joi.boolean(),
  access_type: Joi.string().valid("WEB", "APP"),
});
const update_user_auth = Joi.object({
  user_id: Joi.number().required(),
  full_name: Joi.string().required(),
  profile_img: Joi.string().uri().allow(null, ""),
  phone: Joi.string().pattern(/^\d{10}$/),
  is_active: Joi.boolean().required(),
  is_deleted: Joi.boolean().required(),
});
const signup_user_auth = Joi.object({
  full_name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
const login_user_auth = Joi.object({
  password: Joi.string().required(),
  email: Joi.string().email().required(),
  access_type: Joi.string().valid("WEB", "APP"),
});
const active_user_auth = Joi.object({
  user_id: Joi.number().required(),
  is_active: Joi.boolean().required(),
});

const forget_password_auth = Joi.object({
  email: Joi.string().email().required(),
});

const verify_forget_otp_auth = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().pattern(/^[0-9]{4}$/).required(),
});

const reset_password_auth = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().pattern(/^[0-9]{4}$/).required(),
  new_password: Joi.string().min(6).required(),
});

module.exports = {
  create_user_auth,
  update_user_auth,
  active_user_auth,
  signup_user_auth,
  login_user_auth,
  forget_password_auth,
  verify_forget_otp_auth,
  reset_password_auth,
};
