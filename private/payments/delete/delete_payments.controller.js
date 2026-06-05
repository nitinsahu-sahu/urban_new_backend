const { delete_payments_model } = require("./delete_payments.model");

const delete_payments_controller = async (request, response, next) => {
  try {
    const { payment_id } = request.params;

    const res = await delete_payments_model(payment_id);
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
  delete_payments_controller,
};
