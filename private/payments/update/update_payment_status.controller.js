const { update_payment_status_model } = require("./update_payment_status.model");
const { update_status_auth } = require("../validation_payments");

const update_payment_status_controller = async (request, response, next) => {
  try {
    await update_status_auth.validateAsync(request.body);
    const { payment_id, status, updated_by } = request.body;

    const res = await update_payment_status_model(
      payment_id,
      status,
      updated_by
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
  update_payment_status_controller,
};
