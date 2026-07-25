const { update_notification_model } = require("./update_notification.model");
const { update_notification_auth } = require("../validation_notification");

const update_notification_controller = async (request, response, next) => {
  try {
    await update_notification_auth.validateAsync(request.body);
    const { not_id, title, description, is_active, offer_image = "" } = request.body;

    const res = await update_notification_model(
      not_id,
      title,
      description,
      is_active,
      offer_image
    );
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
  update_notification_controller,
};
