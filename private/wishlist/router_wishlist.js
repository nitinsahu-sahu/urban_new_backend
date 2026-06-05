const express = require("express");

const validateTokenMiddleware = require("../methods/token_validate_middelware");
const {
  toggle_wishlist_controller,
} = require("./create/create_wishlist_controller");
const { get_wishlist_controller } = require("./get/get_wishlist_controller");

const router = express.Router();

router.get("/", validateTokenMiddleware, get_wishlist_controller);
router.post("/toggle", validateTokenMiddleware, toggle_wishlist_controller);

module.exports = router;
