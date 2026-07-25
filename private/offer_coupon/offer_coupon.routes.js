const express = require("express");
const {
  create_offer_coupon_controller,
} = require("./create/create_offer_coupon.controller");
const {
  update_offer_coupon_controller,
} = require("./update/update_offer_coupon.controller");
const {
  delete_offer_coupon_controller,
} = require("./delete/delete_offer_coupon.controller");
const {
  get_offer_coupon_controller,
} = require("./get/get_offer_coupon.controller");
const validateTokenMiddleware = require("../methods/token_validate_middelware");
const router = express.Router();

router.post("/", validateTokenMiddleware, create_offer_coupon_controller);
router.get("/", validateTokenMiddleware, get_offer_coupon_controller);
router.put("/", validateTokenMiddleware, update_offer_coupon_controller);
router.delete("/:id", validateTokenMiddleware, delete_offer_coupon_controller);
module.exports = router;
