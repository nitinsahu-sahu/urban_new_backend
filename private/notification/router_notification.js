const express = require("express");
const {
  create_notification_controller,
} = require("./create/create_notification.controller");
const {
  update_notification_controller,
} = require("./update/update_notification.controller");
const {
  delete_notification_controller,
} = require("./delete/delete_notification.controller");
const validateTokenMiddleware = require("../methods/token_validate_middelware");
const { get_notification_controller } = require("./get/get_notification.controller");
const {
  soft_delete_notification_controller,
  update_read_status_controller,
} = require("./read_status/read_status.controller");
const router = express.Router();

router.get("/", validateTokenMiddleware, get_notification_controller);
router.post("/", validateTokenMiddleware, create_notification_controller);
router.put("/", validateTokenMiddleware, update_notification_controller);
router.delete("/:not_id", validateTokenMiddleware, delete_notification_controller);

// New routes for notification read status
router.post("/read-status", validateTokenMiddleware, update_read_status_controller);
router.post("/soft-delete", validateTokenMiddleware, soft_delete_notification_controller);

module.exports = router;
