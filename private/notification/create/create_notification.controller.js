const { create_notification_model } = require("./create_notification.model");
const { create_notification_auth } = require("../validation_notification");

const create_notification_controller = async (request, response, next) => {
  try {
    await create_notification_auth.validateAsync(request.body);
    const { title, description, is_active, offer_image = "" } = request.body;

    const res = await create_notification_model(
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
  create_notification_controller,
};
