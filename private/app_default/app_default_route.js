const express = require("express");
const {
  create_app_default_controller,
} = require("./create/create_app_default_controller");
const {
  update_app_default_controller,
} = require("./update/update_app_default_controller");
const {
  get_app_default_controller,
} = require("./get/get_app_default_controller");
const validateTokenMiddleware = require("../methods/token_validate_middelware");

const router = express.Router();

router.post("/", validateTokenMiddleware, create_app_default_controller);
router.put("/", validateTokenMiddleware, update_app_default_controller);
router.get("/", validateTokenMiddleware, get_app_default_controller);

module.exports = router;
