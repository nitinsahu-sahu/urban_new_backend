const { update_payments_model } = require("./update_payments.model");
const { update_payment_auth } = require("../validation_payments");

const update_payments_controller = async (request, response, next) => {
  try {
    await update_payment_auth.validateAsync(request.body);
    const { payment_id, order_id, trx_id, amount, status, updated_by } = request.body;

    const res = await update_payments_model(
      payment_id,
      order_id,
      trx_id,
      amount,
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
  update_payments_controller,
};
