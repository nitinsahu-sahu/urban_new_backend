const express = require("express");
const {
  create_brand_controller,
} = require("./create_brand/create_brand.controller");
const {
  update_brand_controller,
} = require("./update_brand/update_brand.controller");
const {
  delete_brand_controller,
} = require("./delete_brand/delete_brand_controller");
const validateTokenMiddleware = require("../methods/token_validate_middelware");
const { get_brand_controller } = require("./get_brand/get_brand_controller");
const router = express.Router();

router.get("/", get_brand_controller);
router.post("/", validateTokenMiddleware, create_brand_controller);
router.put("/", validateTokenMiddleware, update_brand_controller);
router.delete("/:id", validateTokenMiddleware, delete_brand_controller);

module.exports = router;
