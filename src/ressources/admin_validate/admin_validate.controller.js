const { Router } = require("express");
const serviceService = require("../service/service.service");
const {
  getService,
  deleteService,
  updateService,
  createService,
} = require("./service.validation");
const { jsonResponse } = require("../../utils/jsonResponse.util");
const logger = require("./../../config/logger");
const zodValidator = require("../../middleware/zod.middleware");

class ServiceController {
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
      this.serviceService.updateAdminValidate
    );

    this.router.delete(
      `${this.path}/:id`,
      zodValidator(deleteService),
      this.serviceService.deleteAdminValidate
    );
  }
}

module.exports = { ServiceController };
