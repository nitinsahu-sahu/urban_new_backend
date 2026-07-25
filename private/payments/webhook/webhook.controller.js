const { update_payment_status_model } = require("../update/update_payment_status.model");

const webhook_controller = async (request, response, next) => {
  try {
    // Assuming webhook sends { payment_id, status }
    const { payment_id, status } = request.body;

    // For webhook, set updated_by to a default value, e.g., 0 for system
    const updated_by = 0; // System update

    if (!payment_id || !status) {
      return response.status(400).json({
        success: false,
        message: "Invalid webhook data: payment_id and status required",
      });
    }

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
    console.error("Error occurred in webhook", error);
    response.status(200).json({ success: false, error: error.message });
  }
};

module.exports = {
  webhook_controller,
};
