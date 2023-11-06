const { Router } = require("express");
const userService = require("./user.service");
const {
  getUser,
  deleteUser,
  updateUser,
  createUser,
  createProfile,
  updateProfil,
  updateProfile,
} = require("./user.validation");
const { jsonResponse } = require("../../utils/jsonResponse.util");
const logger = require("./../../config/logger");
const zodValidator = require("../../middleware/zod.middleware");
const verifyUser = require("../../middleware/verifyUser");

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
      zodValidator(createProfile),
      verifyUser,
      this.userService.create
    );

    this.router.get(
      `${this.path}/profile/`,
      verifyUser,
      this.userService.getAll
    );

    this.router.put(
      `${this.path}/profile/`,
      zodValidator(updateProfile),
      verifyUser,
      this.userService.updateById
    );
  }
}

module.exports = { UserController };
