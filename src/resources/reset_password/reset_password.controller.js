const { Router } = require("express");
const userService = require("../user/user.service");
const {
  getUser,
  deleteUser,
  updateUser,
  createUser,
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
      zodValidator(updateUser),
      this.userService.updatePassword
    );
  }
}

module.exports = { ResetPasswordController };
