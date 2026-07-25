const { get_orders_model } = require("./get_orders_model");

const get_orders_controller = async (request, response) => {
  try {
    const {
      user_id,
      address_id,
      page,
      limit,
      order_status,
      search,
      start_date,
      end_date,
    } = request.query;
    const res = await get_orders_model(
      user_id,
      address_id,
      page,
      limit,
      order_status,
      search,
      start_date,
      end_date
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
  get_orders_controller,
};
