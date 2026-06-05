const { delete_spacial_offers_model } = require("./delete_spacial_offers_model");


const delete_spacial_offers_controller = async (req, res) => {
  try {
    const { id } = req.params; 
    const result = await delete_spacial_offers_model(id);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error deleting offer:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

module.exports = { delete_spacial_offers_controller };
