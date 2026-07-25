const Joi = require("joi");

const create_notification_auth = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  is_active: Joi.boolean().required(),
  offer_image: Joi.string().allow('').optional(),
});

const update_notification_auth = Joi.object({
  not_id: Joi.number().required(),
  title: Joi.string().required(),
  description: Joi.string().required(),
  is_active: Joi.boolean().required(),
  offer_image: Joi.string().allow('').optional(),
});

const update_read_status_auth = Joi.object({
  user_id: Joi.number().required(),
  noti_id: Joi.number().required(),
  is_readed: Joi.boolean().required(),
});

const soft_delete_auth = Joi.object({
  user_id: Joi.number().required(),
  noti_id: Joi.number().required(),
});

module.exports = {
  create_notification_auth,
  update_notification_auth,
  update_read_status_auth,
  soft_delete_auth,
};
