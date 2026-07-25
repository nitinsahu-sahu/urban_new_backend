const { get_app_default_model } = require("./get_app_default_model");

const get_app_default_controller = async (req, res, next) => {
  try {
    const result = await get_app_default_model();
    res.status(200).json(result);
  } catch (error) {
    next(error);
    console.error("Error in get_app_default_controller:", error);
    res.status(200).json({ success: false, error: error.message });
  }
};

module.exports = {
  get_app_default_controller,
};
