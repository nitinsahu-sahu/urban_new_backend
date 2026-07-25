const { create_address_model } = require("./create_address.model");
const { create_address_auth } = require("../validation_address");

const create_address_controller = async (request, response, next) => {
  try {
    await create_address_auth.validateAsync(request.body);
    const { pincode, state, city, full_address, user_id } = request.body;

    const res = await create_address_model(
      pincode,
      state,
      city,
      full_address,
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
    next(error);
    console.error("Error occurred", error);
    response.status(200).json({ success: false, error: error.message });
  }
};

module.exports = {
  create_address_controller,
};
