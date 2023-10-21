const { Router } = require("express");
const orderService = require("./order.service");
import Stripe from 'stripe';
// const stripe = new Stripe(
//   'sk_test_51NAUrNHfsyM3JiDgg8h3ehA01QWIFUDIXBit0ljMxZDQi1u3cF8eZBRPUYEogGevE86G6i2IxpnrpAbHzNuga3Wz00vd4hE2kd'
// );
const {
  getOrder,
  deleteOrder,
  updateOrder,
  createOrder,
} = require("./order.validation");
const { jsonResponse } = require("../../utils/jsonResponse.util");
const logger = require("./../../config/logger");
const zodValidator = require("../../middleware/zod.middleware");

class OrderController {
  path = "/orders";
  router = Router();
  orderService = new orderService();
  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {

    this.router.post(
      `${this.path}/`,
      zodValidator(createOrder),
      this.orderService.create
    );

    this.router.get(`${this.path}/`, this.orderService.getAll);

    this.router.get(`${this.path}/all/`, this.orderService.getAllOrder);

    this.router.get(`${this.path}/stats/`, this.orderService.getStats);

    this.router.get(
      `${this.path}/add_options/:id`,
      zodValidator(getOrder),
      this.orderService.getAddOptions
    );

    this.router.put(
      `${this.path}/add_options/:id`,
      zodValidator(updateOrder),
      this.orderService.updateAddOptions
    );

    this.router.put(
      `${this.path}/option_update/:id`,
      zodValidator(updateOrder),
      this.orderService.updateOptions
    );

    this.router.get(
      `${this.path}/profil_stat/:id`,
      zodValidator(getOrder),
      this.orderService.getProfilStat
    );

    this.router.get(
      `${this.path}/seller_stat/:id`,
      zodValidator(getOrder),
      this.orderService.getSellerStat
    );

    this.router.get(
      `${this.path}/services/:id`,
      zodValidator(getOrder),
      this.orderService.getServices
    );

    this.router.put(
      `${this.path}/status/:id`,
      zodValidator(updateOrder),
      this.orderService.updateStatus
    );


    this.router.get(
      `${this.path}/:id`,
      zodValidator(getOrder),
      this.orderService.getById
    );

    this.router.put(
      `${this.path}/:id`,
      zodValidator(updateOrder),
      this.orderService.updateById
    );
  }
}

module.exports = { OrderController };
