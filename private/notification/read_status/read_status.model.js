const { pool } = require("../../../dbhelper");

// Soft delete notification for user
const soft_delete_notification_model = async (noti_id, user_id) => {
  try {
    const query = `
      INSERT INTO public.is_noti_readed (noti_id, user_id, is_readed, is_deleted)
      VALUES ($1, $2, false, true)
      ON CONFLICT (noti_id, user_id)
      DO UPDATE SET is_deleted = true
    `;
    const values = [noti_id, user_id];
    await pool.query(query, values);
    return {
      success: true,
      message: "Notification deleted successfully.",
    };
  } catch (error) {
    return {
      success: false,
      message: "An error occurred while deleting notification.",
    };
  }
};

// Update notification read status (mark as read/unread)
const update_read_status_model = async (noti_id, user_id, is_readed) => {
  try {
    const query = `
      INSERT INTO public.is_noti_readed (noti_id, user_id, is_readed, is_deleted)
      VALUES ($1, $2, $3, false)
      ON CONFLICT (noti_id, user_id)
      DO UPDATE SET is_readed = $3
    `;
    const values = [noti_id, user_id, is_readed];
    await pool.query(query, values);
    return {
      success: true,
      message: "Notification read status updated successfully.",
    };
  } catch (error) {
    return {
      success: false,
      message: "An error occurred while updating notification read status.",
    };
  }
};

module.exports = {
  soft_delete_notification_model,
  update_read_status_model,
};
