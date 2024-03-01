const router = require("express").Router();
const controller = require("./orders.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

//route with orderId param
router.route("/:orderId").get(controller.read).put(controller.update).delete(controller.delete).all(methodNotAllowed)

//route for /orders
router.route("/").get(controller.list).post(controller.create).all(methodNotAllowed);

module.exports = router;
