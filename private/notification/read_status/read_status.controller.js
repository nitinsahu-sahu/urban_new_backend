const {
  soft_delete_notification_model,
  update_read_status_model,
} = require("./read_status.model");
const {
  update_read_status_auth,
  soft_delete_auth,
} = require("../validation_notification");

// Update read status (mark as read/unread)
const update_read_status_controller = async (request, response, next) => {
  try {
    await update_read_status_auth.validateAsync(request.body);
    const { user_id, noti_id, is_readed } = request.body;

    const res = await update_read_status_model(noti_id, user_id, is_readed);
    response.status(200).json(res);
  } catch (error) {
    next(error);
    console.error("Error occurred", error);
    response.status(200).json({ success: false, error: error.message });
  }
};

// Soft delete notification
const soft_delete_notification_controller = async (request, response, next) => {
  try {
    await soft_delete_auth.validateAsync(request.body);
    const { user_id, noti_id } = request.body;

    const res = await soft_delete_notification_model(noti_id, user_id);
    response.status(200).json(res);
  } catch (error) {
    next(error);
    console.error("Error occurred", error);
    response.status(200).json({ success: false, error: error.message });
  }
};

module.exports = {
  soft_delete_notification_controller,
  update_read_status_controller,
};
