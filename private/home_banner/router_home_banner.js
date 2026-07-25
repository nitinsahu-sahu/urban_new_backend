const express = require("express");
const {
  create_home_banner_controller,
} = require("./create/create_home_banner.controller");
const {
  update_home_banner_controller,
} = require("./update/update_home_banner.controller");
const {
  delete_home_banner_controller,
} = require("./delete/delete_home_banner.controller");
const validateTokenMiddleware = require("../methods/token_validate_middelware");
const { get_home_banner_controller } = require("./get/get_home_banner.controller");
const router = express.Router();

router.get("/",  get_home_banner_controller);
router.post("/", validateTokenMiddleware, create_home_banner_controller);
router.put("/", validateTokenMiddleware, update_home_banner_controller);
router.delete("/:banner_id", validateTokenMiddleware, delete_home_banner_controller);

module.exports = router;
