const express = require("express");
const router = express.Router();
const {
  create_product_rating_controller,
} = require("./create/create_product_rating.controller");
const {
  get_product_rating_controller,
} = require("./get/get_product_rating.controller");
const {
  update_product_rating_controller,
} = require("./update/update_product_rating.controller");
const {
  delete_product_rating_controller,
} = require("./delete/delete_product_rating.controller");
const validateTokenMiddleware = require("../methods/token_validate_middelware");
const { product_rating_active_controller } = require("./is_active/product_rating_active.controller");

router.get("/", validateTokenMiddleware, get_product_rating_controller);
router.post("/", validateTokenMiddleware, create_product_rating_controller);
router.put("/", validateTokenMiddleware, update_product_rating_controller);
router.patch("/", validateTokenMiddleware, product_rating_active_controller);
router.delete(
  "/:id",
  validateTokenMiddleware,
  delete_product_rating_controller
);

module.exports = router;
