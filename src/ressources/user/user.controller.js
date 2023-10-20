const { Router } = require("express");
const userService = require("./user.service");
const {
  getUser,
  deleteUser,
  updateUser,
  createUser,
} = require("./user.validation");
const { jsonResponse } = require("../../utils/jsonResponse.util");
const logger = require("./../../config/logger");
const zodValidator = require("../../middleware/zod.middleware");

class UserController {
  path = "/users";
  router = Router();
  userService = new userService();
  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {

    this.router.post(
      `${this.path}/profile/`,
      zodValidator(createUser),
      this.userService.create
    );

    this.router.get(`${this.path}/profile/`, this.userService.getAll);

    this.router.put(
      `${this.path}/profile/`,
      zodValidator(updateUser),
      this.userService.updateById
    );
  }
}

module.exports = { UserController };
