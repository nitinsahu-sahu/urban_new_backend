const { pool } = require("../../../dbhelper");

const update_notification_model = async (
  not_id,
  title,
  description,
  is_active,
  offer_image
) => {
  try {
    const query = `UPDATE public.notification
    SET title=$2, description=$3, is_active=$4, offer_image=$5
    WHERE not_id=$1 RETURNING *;`;
    const value = [
      not_id,
      title,
      description,
      is_active,
      offer_image,
    ];
    const result = await pool.query(query, value);
    if (result.rows.length != 0) {
      return {
        success: true,
        message: "Notification updated Successfully!",
        data: result.rows,
      };
    } else {
      return {
        success: false,
        message: "Notification not updated!",
        data: {
          not_id,
          title,
          description,
          is_active,
          offer_image,
        },
      };
    }
  } catch (err) {
    console.error("Error in update_notification_model:", err);
    return {
      success: false,
      error: "An unexpected error occurred while processing the request.",
    };
  }
};

module.exports = {
  update_notification_model,
};
