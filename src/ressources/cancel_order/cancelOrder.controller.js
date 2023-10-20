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
      this.cancelOrderService.create
    );
    
    this.router.get(`${this.path}/`, this.cancelOrderService.getAll);

    this.router.get(
      `${this.path}/:id`,
      zodValidator(getCancelOrder),
      this.cancelOrderService.getById
    );

    this.router.put(
      `${this.path}/:id`,
      zodValidator(updateCancelOrder),
      this.cancelOrderService.updateById
    );
  }
}

module.exports = { CancelOrderController };
