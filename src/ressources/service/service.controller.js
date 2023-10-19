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

class ServiceController {
  path = "/services";
  router = Router();
  serviceService = new serviceService();
  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get(`${this.path}/admin_all_service/`, this.serviceService.getAll);

    this.router.get(`${this.path}/categories/`, this.serviceService.getAllCategory);

    this.router.get(`${this.path}/favorites/`, this.serviceService.getAllFavorites);

    this.router.get(`${this.path}/fecth_all/`, this.serviceService.getAllService);

    this.router.get(`${this.path}/fetch_data/`, this.serviceService.getAllServiceWithUserData);

    this.router.get(`${this.path}/myservice/`, this.serviceService.getAllServiceOfUser);

    this.router.get(`${this.path}/search/`, this.serviceService.searchService);

    this.router.post(
      `${this.path}/creation_step0/`,
      this.serviceService.create,
      zodValidator(createService)
    );

    this.router.put(
      `${this.path}/creation_step2/:id`,
      this.serviceService.create_step2,
      zodValidator(updateService)
    );

    this.router.put(
      `${this.path}/creation_step3/:id`,
      this.serviceService.create_step3,
      zodValidator(updateService)
    );

    this.router.put(
      `${this.path}/creation_step4/:id`,
      this.serviceService.create_step4,
      zodValidator(updateService)
    );

    this.router.put(
      `${this.path}/creation_step5/:id`,
      this.serviceService.create_step5,
      zodValidator(updateService)
    );

    this.router.put(
      `${this.path}/creation_step6/:id`,
      this.serviceService.create_step6,
      zodValidator(updateService)
    );

    this.router.put(
      `${this.path}/favorites/`,
      this.serviceService.createFavorite,
      zodValidator(updateService)
    );

    this.router.get(
      `${this.path}/getbyuser/:id`, 
      zodValidator(getService),
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
      this.serviceService.getById
    );

    this.router.patch(
      `${this.path}/:id`,
      zodValidator(updateService),
      this.serviceService.patchById
    );

    this.router.put(
      `${this.path}/:id`,
      zodValidator(updateService),
      this.serviceService.updateById
    );

    this.router.delete(
      `${this.path}/:id`,
      zodValidator(deleteService),
      this.serviceService.deleteById
    );
  }
}

module.exports = { ServiceController };
