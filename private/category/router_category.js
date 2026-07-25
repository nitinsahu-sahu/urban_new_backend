const express = require("express");
const {
  get_category_controller,
} = require("./get_category/get_category_controller");
const {
  create_category_controller,
} = require("./create_category/create_category.controller");
const {
  update_category_controller,
} = require("./update_category/update_category.controller");
const {
  delete_category_controller,
} = require("./delete_category/delete_category_controller");
const validateTokenMiddleware = require("../methods/token_validate_middelware");

const router = express.Router();

router.get("/", get_category_controller);
router.post("/", validateTokenMiddleware, create_category_controller);
router.put("/", validateTokenMiddleware, update_category_controller);
router.delete("/:id", validateTokenMiddleware, delete_category_controller);

module.exports = router;
