const { get_address_model } = require("./get_address_model");

const get_address_controller = async (request, response) => {
  try {
    const { user_id, address_id, page, limit, search } = request.query;
    const res = await get_address_model(
      user_id,
      address_id,
      page,
      limit,
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
  get_address_controller,
};
