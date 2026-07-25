const { update_publish_spacial_offers_model } = require("./publish_spacial_offers_model");

const update_publish_spacial_offers_controller = async (req, res) => {
  try {
    const { id, publish } = req.body;
    const result = await update_publish_spacial_offers_model(id, publish);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error updating publish:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

module.exports = { update_publish_spacial_offers_controller };
