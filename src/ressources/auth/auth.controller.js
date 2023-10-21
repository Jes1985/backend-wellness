const { Router } = require("express");
const authService = require("./auth.service");
const { login } = require("./auth.validation");
const zodValidator = require("../../middleware/zod.middleware");

class authController {
  path = "/auth";
  router = Router();
  authService = new authService();
  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post(
      `${this.path}/login/`,
      zodValidator(login),
      this.authService.oAuthLogin
    );
  }
}

module.exports = { authController };
