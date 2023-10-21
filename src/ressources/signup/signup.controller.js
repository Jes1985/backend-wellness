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

class UserController {
  path = "/signup";
  router = Router();
  userService = new userService();
  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {

    this.router.get(`${this.path}/`, this.userService.getAllSignUp);

    this.router.patcposth(
      `${this.path}/`,
      zodValidator(updateUser),
      this.userService.updateSignup
    );
  }
}

module.exports = { UserController };
