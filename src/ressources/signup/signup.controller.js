const { Router } = require("express");
const userService = require("../user/user.service");
const {
  getUser,
  deleteUser,
  updateUser,
  createUser,
} = require("../user/user.validation");
const jwt = require("jsonwebtoken");
const { jsonResponse } = require("../../utils/jsonResponse.util");
const logger = require("./../../config/logger");
const zodValidator = require("../../middleware/zod.middleware");
const verifyUser = require("../../middleware/verifyUser");

class UserController {
  path = "/signup";
  router = Router();
  userService = new userService();
  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get(`${this.path}/`, verifyUser, this.userService.getAllSignUp);

    this.router.post(
      `${this.path}/`,
      zodValidator(updateUser),
      this.userService.updateSignup
    );
  }
}

module.exports = { UserController };
