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
const verifyUser = require("../../middleware/verifyUser");
const Stripe = require('stripe');


class StripeController {
  path = "/stripe";
  router = Router();
  stripeService = new stripeService();
  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {

    this.router.get(`${this.path}/get_account_balance/`, verifyUser, this.stripeService.getAccountBalance);

    this.router.get(`${this.path}/getcarte_info/`, verifyUser, this.stripeService.getCarteInfo);

    this.router.get(`${this.path}/plan/manage_plan/`, verifyUser, this.stripeService.getManagePlan);

    this.router.get(`${this.path}/plan/sublist/`, verifyUser, this.stripeService.getSublistPlan);

    this.router.get(`${this.path}/plan/subscription/`, verifyUser, this.stripeService.getSubscriptionPlan);

    this.router.get(`${this.path}/plan/user_subscription/`, verifyUser, this.stripeService.getUserSubscriptionPlan);

    this.router.get(`${this.path}/update_carte_info/`, verifyUser, this.stripeService.getUpdateCarteInfo);


    this.router.post(
      `${this.path}/monney_to_pay/`,
      verifyUser,
      this.stripeService.createMonneyToPay
    );

    this.router.post(
      `${this.path}/option_payement/:id`,
      verifyUser,
      this.stripeService.createOptionPayement
    );

    this.router.post(
      `${this.path}/payement/:id`,
      verifyUser,
      this.stripeService.createPayement
    );

    this.router.get(
      `${this.path}/payement/:id`,
      this.stripeService.getPayement
    );

    this.router.post(
      `${this.path}/payment_settings/`,
      verifyUser,
      this.stripeService.createPaymentSettings
    );

    this.router.post(
      `${this.path}/payout_settings/`,
      verifyUser,
      this.stripeService.createPayoutSettings
    );

    this.router.post(
      `${this.path}/plan/subscription/`,
      verifyUser,
      this.stripeService.createSubscriptionPlan
    );

    this.router.post(
      `${this.path}/retrieve/`,
      verifyUser,
      this.stripeService.UpdateUser
    );

    this.router.post(
      `${this.path}/user_accompte/`,
      verifyUser,
      this.stripeService.UpdateUserAccompte
    );
  }
}

module.exports = { StripeController };
