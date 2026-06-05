const express = require("express");
const {
  create_payments_controller,
} = require("./create/create_payments.controller");
const {
  update_payments_controller,
} = require("./update/update_payments.controller");
const {
  update_payment_status_controller,
} = require("./update/update_payment_status.controller");
const {
  delete_payments_controller,
} = require("./delete/delete_payments.controller");
const validateTokenMiddleware = require("../methods/token_validate_middelware");
const { get_payments_controller } = require("./get/get_payments.controller");
const { webhook_controller } = require("./webhook/webhook.controller");
const router = express.Router();

router.get("/", validateTokenMiddleware, get_payments_controller);
router.post("/", validateTokenMiddleware, create_payments_controller);
router.put("/", validateTokenMiddleware, update_payments_controller);
router.patch("/status", validateTokenMiddleware, update_payment_status_controller);
router.delete("/:payment_id", validateTokenMiddleware, delete_payments_controller);

// Webhook route - no token validation as it's external
router.post("/webhook", webhook_controller);

module.exports = router;
