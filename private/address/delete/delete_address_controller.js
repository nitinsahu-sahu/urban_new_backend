const { delete_address_model } = require("./delete_address.model");

const delete_address_controller = async (request, response, next) => {
  try {
    const address_id = request.params.id;
    const res = await delete_address_model(address_id);
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
  delete_address_controller,
};
