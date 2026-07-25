const { create_payments_model } = require("./create_payments.model");
const { create_payment_auth } = require("../validation_payments");

const create_payments_controller = async (request, response, next) => {
  try {
    await create_payment_auth.validateAsync(request.body);
    const { order_id, trx_id, amount, status, created_by } = request.body;

    const res = await create_payments_model(
      order_id,
      trx_id,
      amount,
      status,
      created_by
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
  create_payments_controller,
};
