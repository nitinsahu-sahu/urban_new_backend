const { pool } = require("../../../dbhelper");

const delete_notification_model = async (not_id) => {
  try {
    const query = `DELETE FROM public.notification
    WHERE not_id = $1 RETURNING *;`;
    const value = [not_id];
    const result = await pool.query(query, value);
    if (result.rows.length != 0) {
      return {
        success: true,
        message: `Notification deleted successfully.`,
        data: result.rows,
      };
    } else {
      return {
        success: false,
        message: "Notification not deleted!",
        data: { not_id },
      };
    }
  } catch (err) {
    console.error("Error in delete_notification_model:", err);
    return {
      success: false,
      error: "An unexpected error occurred while processing the request.",
    };
  }
};

module.exports = {
  delete_notification_model,
};
