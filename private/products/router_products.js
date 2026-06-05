const express = require("express");
const {
  get_product_controller,
} = require("./get_product/get_product_controller");
const {
  create_products_controller,
} = require("./create_product/create_products.controller");
const {
  update_products_controller,
} = require("./update_product/update_products.controller");
const {
  active_product_controller,
} = require("./active/active_product_controller");
const {
  delete_product_controller,
} = require("./delete_product/delete_product_controller");
const validateTokenMiddleware = require("../methods/token_validate_middelware");

const router = express.Router();

router.get("/", get_product_controller);
router.post("/", validateTokenMiddleware, create_products_controller);
router.put("/", validateTokenMiddleware, update_products_controller);
router.patch("/", validateTokenMiddleware, active_product_controller);
router.delete("/:id", validateTokenMiddleware, delete_product_controller);

module.exports = router;
