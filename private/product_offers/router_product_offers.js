const express = require("express");
const {
  create_product_offers_controller,
} = require("./create/create_product_offers.controller");
const {
  update_product_offers_controller,
} = require("./update/update_product_offers.controller");
const {
  delete_product_offers_controller,
} = require("./delete/delete_product_offers.controller");
const validateTokenMiddleware = require("../methods/token_validate_middelware");
const { get_product_offers_controller } = require("./get/get_product_offers.controller");
const router = express.Router();

router.get("/", validateTokenMiddleware, get_product_offers_controller);
router.post("/", validateTokenMiddleware, create_product_offers_controller);
router.put("/", validateTokenMiddleware, update_product_offers_controller);
router.delete("/:offer_id", validateTokenMiddleware, delete_product_offers_controller);

module.exports = router;
