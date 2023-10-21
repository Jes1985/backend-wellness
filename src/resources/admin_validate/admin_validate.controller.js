const { Router } = require("express");
const serviceService = require("../service/service.service");
const {
  deleteService,
  updateService,
} = require("../service/service.validation");
const { jsonResponse } = require("../../utils/jsonResponse.util");
const logger = require("./../../config/logger");
const zodValidator = require("../../middleware/zod.middleware");
const verifyUser = require("../../middleware/verifyUser");

class AdminValidateController {
  path = "/admin_validate";
  router = Router();
  serviceService = new serviceService();
  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.put(
      `${this.path}/:id`,
      zodValidator(updateService),
      verifyUser,
      this.serviceService.updateAdminValidate
    );

    this.router.delete(
      `${this.path}/:id`,
      zodValidator(deleteService),
      this.serviceService.deleteAdminValidate
    );
  }
}

module.exports = { AdminValidateController };
