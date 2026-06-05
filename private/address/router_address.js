const express = require("express");
const {
  create_address_controller,
} = require("./create/create_address.controller");
const {
  update_address_controller,
} = require("./update/update_address.controller");
const {
  delete_address_controller,
} = require("./delete/delete_address_controller");
const validateTokenMiddleware = require("../methods/token_validate_middelware");
const { get_address_controller } = require("./get/get_address_controller");
const router = express.Router();

router.get("/", validateTokenMiddleware, get_address_controller);
router.post("/", validateTokenMiddleware, create_address_controller);
router.put("/", validateTokenMiddleware, update_address_controller);
router.delete("/:id", validateTokenMiddleware, delete_address_controller);

module.exports = router;
