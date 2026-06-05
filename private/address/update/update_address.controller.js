const { update_address_model } = require("./update_address.model");
const { update_address_auth } = require("../validation_address");

const update_address_controller = async (request, response, next) => {
  try {
    await update_address_auth.validateAsync(request.body);
    const { address_id, pincode, state, city, full_address, user_id } =
      request.body;

    const res = await update_address_model(
      address_id,
      pincode,
      state,
      city,
      full_address
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
    next(error);
    console.error("Error occurred", error);
    response.status(200).json({ success: false, error: error.message });
  }
};

module.exports = {
  update_address_controller,
};
