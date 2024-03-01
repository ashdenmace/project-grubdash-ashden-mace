const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

function dishExists(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  }
  next({
    status: 404,
    message: `Dish does not exist: ${dishId}`,
  });
}

function bodyDataHas(property) {
  return function validateData(req, res, next) {
    const { data = {} } = req.body;
    if (data[property]) {
      return next();
    }
    next({ status: 400, message: `Dish must include a ${property}` });
  };
}

function validatePrice(req, res, next) {
  const { data: { price } = {} } = req.body;
  if (price <= 0 || !Number.isInteger(price)) {
    return next({ status: 400, message: `Dish must have a price that is an integer greater than 0` });
  }
  next();
}

function doesIdMatch(req, res, next) {
  const { data: { id } = {} } = req.body;
  const { dishId } = req.params;
  if (id && id !== dishId) {
    return next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
    });
  }
  next();
}

function list(req, res, next) {
  res.json({ data: dishes });
}

function read(req, res, next) {
  res.json({ data: res.locals.dish });
}

function update(req, res, next) {
  const { dishId } = req.params;
  const { data: { name, description, price, image_url } = {} } = req.body;
  const foundDish = res.locals.dish;

  foundDish.name = name;
  foundDish.description = description;
  foundDish.price = price;
  foundDish.image_url = image_url;

  res.json({ data: foundDish });
}

function create(req, res, next) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  const newDish = {
    id: nextId(),
    name,
    description,
    price,
    image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

module.exports = {
  list,
  read: [dishExists, read],
  create: [
    bodyDataHas("name"),
    bodyDataHas("description"),
    bodyDataHas("price"),
    bodyDataHas("image_url"),
    validatePrice,
    create,
  ],
  update: [
    dishExists,
    bodyDataHas("name"),
    bodyDataHas("description"),
    bodyDataHas("price"),
    bodyDataHas("image_url"),
    validatePrice,
    doesIdMatch,
    update,
  ],
};
