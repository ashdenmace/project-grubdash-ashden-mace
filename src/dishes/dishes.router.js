const router = require("express").Router();
const controller = require("./dishes.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

//route with dishId param;
router.route("/:dishId").get(controller.read).put(controller.update).all(methodNotAllowed)

//route for /dishes
router.route("/").get(controller.list).post(controller.create).all(methodNotAllowed);

module.exports = router;
