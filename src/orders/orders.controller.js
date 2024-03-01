const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

function doesOrderExist(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder) {
    res.locals.order = foundOrder;
    return next();
  }
  next({
    status: 404,
    message: `Order does not exist: ${orderId}`,
  });
}

function bodyDataHas(property) {
  return function validateData(req, res, next) {
    const { data = {} } = req.body;
    if (data[property]) {
      return next();
    }
    next({ status: 400, message: `Order must include a ${property}` });
  };
}

function isDishesArray(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  if (!Array.isArray(dishes)) {
    return next({
      status: 400,
      message: `Order must include at least one dish`,
    });
  }
  return next();
}

function validateDishesLength(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  if (!dishes.length > 0) {
    return next({
      status: 400,
      message: `Order must include at least one dish`,
    });
  }
  return next();
}

function validateEachDish(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  dishes.map((dish, index) => {
    if (
      !dish.quantity ||
      !Number.isInteger(dish.quantity) ||
      dish.quantity < 0
    ) {
      return next({
        status: 400,
        message: `Dish ${index} must have a quantity that is an integer greater than 0.`,
      });
    }
  });
  return next();
}

function doesIdMatch(req, res, next) {
  const { data: { id } = {} } = req.body;
  const { orderId } = req.params;
  if (id && id !== orderId) {
    return next({
      status: 400,
      message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`,
    });
  }
  return next();
}

function validateStatus(req, res, next) {
  const { data: { status } = {} } = req.body;
  if (
    status === "pending" ||
    status === "out-for-delivery" ||
    status === "preparing"
  ) {
    return next();
  }
  if (status === "delivered") {
    return next({
      status: 400,
      message: "A delivered order cannot be changed",
    });
  }
  return next({
    status: 400,
    message:
      "Order must have a status of pending, preparing, out-for-delivery, delivered",
  });
}

function validateDeletion(req, res, next) {
  const order = res.locals.order;
  if (order.status === "pending") {
    return next();
  }
  return next({
    status: 400,
    message: "An order cannot be deleted unless it is pending. ",
  });
}

function list(req, res, next) {
  res.json({ data: orders });
}

function read(req, res, next) {
  res.json({ data: res.locals.order });
}

function create(req, res, next) {
  const { data: { deliverTo, mobileNumber, dishes, quantity, status } = {} } =
    req.body;
  const newOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    status,
    dishes,
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

function update(req, res, next) {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  const foundOrder = res.locals.order;

  foundOrder.deliverTo = deliverTo;
  foundOrder.mobileNumber = mobileNumber;
  foundOrder.status = status;
  foundOrder.dishes = dishes;

  res.json({ data: foundOrder });
}

function destroy(req, res, next) {
  const { orderId } = req.params;
  const index = orders.findIndex((order) => order.id === orderId);
  orders.splice(index, 1);
  res.sendStatus(204);
}

module.exports = {
  list,
  create: [
    bodyDataHas("deliverTo"),
    bodyDataHas("mobileNumber"),
    bodyDataHas("dishes"),
    isDishesArray,
    validateDishesLength,
    validateEachDish,
    create,
  ],
  read: [doesOrderExist, read],
  update: [
    doesOrderExist,
    bodyDataHas("deliverTo"),
    bodyDataHas("mobileNumber"),
    bodyDataHas("dishes"),
    bodyDataHas("status"),
    isDishesArray,
    validateDishesLength,
    validateEachDish,
    validateStatus,
    doesIdMatch,
    update,
  ],
  delete: [doesOrderExist, validateDeletion, destroy],
};
