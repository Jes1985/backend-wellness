const { Router } = require("express");
const orderService = require("../order/order.service");
const {
  getOrder,
  deleteOrder,
  updateOrder,
  createOrder,
} = require("../order/order.validation");
const { jsonResponse } = require("../../utils/jsonResponse.util");
const logger = require("./../../config/logger");
const zodValidator = require("../../middleware/zod.middleware");
const verifyUser = require("../../middleware/verifyUser");

class OrderStatController {
  path = "/orderstats";
  router = Router();
  orderService = new orderService();
  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get(
      `${this.path}/`,
      verifyUser,
      this.orderService.getOrderstats
    );
  }
}

module.exports = { OrderStatController };
