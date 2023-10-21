const { Router } = require("express");
const stripeService = require("./stripe.service");
const {
  getStripe,
  deleteStripe,
  updateStripe,
  createStripe,
} = require("./stripe.validation");
const { jsonResponse } = require("../../utils/jsonResponse.util");
const logger = require("./../../config/logger");
const zodValidator = require("../../middleware/zod.middleware");

class StripeController {
  path = "/stripes";
  router = Router();
  stripeService = new stripeService();
  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {

    this.router.get(`${this.path}/get_account_balance/`, this.stripeService.getAccountBalance);

  }
}

module.exports = { StripeController };
