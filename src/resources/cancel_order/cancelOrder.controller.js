const { Router } = require("express");
const cancelOrderService = require("./cancelOrder.service");
const {
  getCancelOrder,
  deleteCancelOrder,
  updateCancelOrder,
  createCancelOrder,
} = require("./cancelOrder.validation");
const { jsonResponse } = require("../../utils/jsonResponse.util");
const logger = require("./../../config/logger");
const zodValidator = require("../../middleware/zod.middleware");
const verifyUser = require("../../middleware/verifyUser");

class CancelOrderController {
  path = "/cancelOrders";
  router = Router();
  cancelOrderService = new cancelOrderService();
  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {

    this.router.post(
      `${this.path}/`,
      zodValidator(createCancelOrder),
      verifyUser,
      this.cancelOrderService.create
    );

    this.router.get(`${this.path}/`, verifyUser, this.cancelOrderService.getAll);

    this.router.get(
      `${this.path}/:id`,
      zodValidator(getCancelOrder),
      verifyUser,
      this.cancelOrderService.getById
    );

    this.router.put(
      `${this.path}/:id`,
      zodValidator(updateCancelOrder),
      verifyUser,
      this.cancelOrderService.updateById
    );
  }
}

module.exports = { CancelOrderController };
