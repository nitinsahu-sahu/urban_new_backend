const { pool } = require("../../../dbhelper");
const { random_number } = require("../../methods/random_number");
const { current_epoch_time } = require("../../methods/current_epoch_time");

const create_notification_model = async (
  title,
  description,
  is_active,
  offer_image
) => {
  try {
    const not_id = random_number();
    const created_at = current_epoch_time();
    const query = `INSERT INTO public.notification(
      not_id, title, description, created_at, is_active, offer_image)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;`;
    const value = [
      not_id,
      title,
      description,
      created_at,
      is_active,
      offer_image,
    ];
    const result = await pool.query(query, value);
    if (result.rows.length != 0) {
      return {
        success: true,
        message: "Notification Created Successfully!",
        data: result.rows,
      };
    } else {
      return {
        success: false,
        message: "Notification not Created!",
        data: {
          title,
          description,
          is_active,
          offer_image,
        },
      };
    }
  } catch (err) {
    console.error("Error in create_notification_model:", err);
    return {
      success: false,
      error: "An unexpected error occurred while processing the request.",
    };
  }
};

module.exports = {
  create_notification_model,
};
