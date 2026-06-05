const { get_user_model } = require("./get_user_model");

const get_user = async (request, response) => {
  try {
    const { user_id, page, limit, is_active, is_deleted, search } =
      request.query;
    const res = await get_user_model(
      user_id,
      page,
      limit,
      is_active,
      is_deleted,
      search
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
  get_user,
};
