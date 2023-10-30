const { Router } = require("express");
const userService = require("../user/user.service");
const {
  resetPassword
} = require("../user/user.validation");
const { jsonResponse } = require("../../utils/jsonResponse.util");
const logger = require("./../../config/logger");
const zodValidator = require("../../middleware/zod.middleware");

class ResetPasswordController {
  path = "/reset_password";
  router = Router();
  userService = new userService();
  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.patch(
      `${this.path}/`,
      zodValidator(resetPassword),
      this.userService.updatePassword
    );
  }
}

module.exports = { ResetPasswordController };
