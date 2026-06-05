const { delete_notification_model } = require("./delete_notification.model");

const delete_notification_controller = async (request, response, next) => {
  try {
    const { not_id } = request.params;

    const res = await delete_notification_model(not_id);
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
  delete_notification_controller,
};
