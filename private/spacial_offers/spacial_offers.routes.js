const express = require("express");
const {
  create_spacial_offer_controller,
} = require("./create/create_spacial_offer_controller");
const {
  update_spacial_offers_controller,
} = require("./update/update_spacial_offers_controller");
const {
  get_spacial_offers_controller,
} = require("./get/get_spacial_offers_controller");
const {
  update_publish_spacial_offers_controller,
} = require("./publish/publish_spacial_offers_controller");
const {
  delete_spacial_offers_controller,
} = require("./delete/delete_spacial_offers_controller");
const validateTokenMiddleware = require("../methods/token_validate_middelware");
const router = express.Router();

router.post("/", validateTokenMiddleware, create_spacial_offer_controller);
router.put("/", validateTokenMiddleware, update_spacial_offers_controller);
router.get("/", get_spacial_offers_controller);
router.patch(
  "/",
  validateTokenMiddleware,
  update_publish_spacial_offers_controller
);
router.delete("/:id", validateTokenMiddleware, delete_spacial_offers_controller);

module.exports = router;
