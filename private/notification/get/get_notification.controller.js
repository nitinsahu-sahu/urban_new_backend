const { get_notification_model } = require("./get_notification.model");

const get_notification_controller = async (request, response) => {
  try {
    const { not_id, is_active, page, limit, search } = request.query;
    const { user_id } = request.user;
    const res = await get_notification_model(
      not_id,
      is_active,
      page,
      limit,
      search,
      user_id
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
    console.error("Error occurred", error);
    response.status(200).json({ success: false, error: error.message });
  }
};

module.exports = {
  get_notification_controller,
};
