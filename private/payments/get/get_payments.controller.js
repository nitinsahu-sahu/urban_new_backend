const { get_payments_model } = require("./get_payments.model");

const get_payments_controller = async (request, response) => {
  try {
    const { payment_id, order_id, page, limit, search } = request.query;
    const res = await get_payments_model(
      payment_id,
      order_id,
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
  get_payments_controller,
};
