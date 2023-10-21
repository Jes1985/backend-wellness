const { Router } = require("express");
const serviceService = require("./service.service");
const {
  getService,
  deleteService,
  updateService,
  createService,
} = require("./service.validation");
const { jsonResponse } = require("../../utils/jsonResponse.util");
const logger = require("./../../config/logger");
const zodValidator = require("../../middleware/zod.middleware");
const verifyUser = require("../../middleware/verifyUser");

class ServiceController {
  path = "/services";
  router = Router();
  serviceService = new serviceService();
  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get(`${this.path}/admin_all_service/`, verifyUser, this.serviceService.getAll);

    this.router.get(`${this.path}/categories/`, this.serviceService.getAllCategory);

    this.router.get(`${this.path}/favorites/`, verifyUser, this.serviceService.getAllFavorites);

    this.router.get(`${this.path}/fecth_all/`, this.serviceService.getAllService);

    this.router.get(`${this.path}/fetch_data/`, this.serviceService.getAllServiceWithUserData);

    this.router.get(`${this.path}/myservice/`, verifyUser, this.serviceService.getAllServiceOfUser);

    this.router.get(`${this.path}/search/`, this.serviceService.searchService);

    this.router.post(
      `${this.path}/creation_step0/`,
      this.serviceService.create,
      verifyUser,
      zodValidator(createService)
    );

    this.router.put(
      `${this.path}/creation_step2/:id`,
      this.serviceService.create_step2,
      verifyUser,
      zodValidator(updateService)
    );

    this.router.put(
      `${this.path}/creation_step3/:id`,
      this.serviceService.create_step3,
      verifyUser,
      zodValidator(updateService)
    );

    this.router.put(
      `${this.path}/creation_step4/:id`,
      this.serviceService.create_step4,
      verifyUser,
      zodValidator(updateService)
    );

    this.router.put(
      `${this.path}/creation_step5/:id`,
      this.serviceService.create_step5,
      verifyUser,
      zodValidator(updateService)
    );

    this.router.put(
      `${this.path}/creation_step6/:id`,
      this.serviceService.create_step6,
      verifyUser,
      zodValidator(updateService)
    );

    this.router.put(
      `${this.path}/favorites/`,
      this.serviceService.createFavorite,
      verifyUser,
      zodValidator(updateService)
    );

    this.router.get(
      `${this.path}/getbyuser/:id`,
      zodValidator(getService),
      verifyUser,
      this.serviceService.getAllServiceByUser,
    );

    this.router.get(
      `${this.path}/seller_services/:id`,
      zodValidator(getService),
      this.serviceService.getSellerServices,
    );





    this.router.get(
      `${this.path}/:id`,
      zodValidator(getService),
      verifyUser,
      this.serviceService.getById
    );

    this.router.patch(
      `${this.path}/:id`,
      zodValidator(updateService),
      verifyUser,
      this.serviceService.patchById
    );

    this.router.put(
      `${this.path}/:id`,
      zodValidator(updateService),
      verifyUser,
      this.serviceService.updateById
    );

    this.router.delete(
      `${this.path}/:id`,
      zodValidator(deleteService),
      verifyUser,
      this.serviceService.deleteById
    );
  }
}

module.exports = { ServiceController };
