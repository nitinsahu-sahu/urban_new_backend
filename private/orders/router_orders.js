const express = require("express");
const {
  create_orders_controller,
} = require("./create/create_orders.controller");
const validateTokenMiddleware = require("../methods/token_validate_middelware");
const { get_orders_controller } = require("./get/get_orders_controller");
const { delete_order_controller } = require("./delete/delete_order_controller");
const {
  update_orders_status_controller,
} = require("./update_status/update_orders_status_controller");
const {
  update_orders_address_controller,
} = require("./update_address/update_address_orders.controller");
const {
  update_orders_quantity_controller,
} = require("./update_quantity/update_quantity_orders.controller");

const {
  get_orders_count_controller,
} = require("./get_order_count/get_order_count.controller");
const {
  update_orders_controller,
} = require("./update_orders/update_orders.controller");
const {
  check_in_cart_controller,
} = require("./check_in_cart/check_in_cart_controller");
const router = express.Router();

router.get("/", validateTokenMiddleware, get_orders_controller);
router.get("/check-in-cart", validateTokenMiddleware, check_in_cart_controller);
router.post("/", validateTokenMiddleware, create_orders_controller);
router.patch("/", validateTokenMiddleware, update_orders_status_controller);
router.patch(
  "/quantity",
  validateTokenMiddleware,
  update_orders_quantity_controller
);
router.patch(
  "/address",
  validateTokenMiddleware,
  update_orders_address_controller
);
router.delete("/:id", validateTokenMiddleware, delete_order_controller);
router.put("/update", validateTokenMiddleware, update_orders_controller);
router.get(
  "/order-count",
  validateTokenMiddleware,
  get_orders_count_controller
);
module.exports = router;
