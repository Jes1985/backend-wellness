const { Router } = require("express");
const blogService = require("./blog.service");
const {
  getBlog,
  deleteBlog,
  updateBlog,
  createBlog,
} = require("./blog.validation");
const { jsonResponse } = require("../../utils/jsonResponse.util");
const logger = require("./../../config/logger");
const zodValidator = require("../../middleware/zod.middleware");
const verifyUser = require("../../middleware/verifyUser");

class BlogController {
  path = "/blogs";
  router = Router();
  blogService = new blogService();
  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post(
      `${this.path}/`,
      zodValidator(createBlog),
      verifyUser,
      this.blogService.create
    );

    this.router.get(`${this.path}/`, this.blogService.getAll);

    this.router.get(`${this.path}/admin/list/`, this.blogService.getAdminList);

    this.router.get(
      `${this.path}/by-categories/`,
      this.blogService.getByCategory
    );

    this.router.get(
      `${this.path}/:id`,
      zodValidator(getBlog),
      this.blogService.getById
    );
    this.router.delete(
      `${this.path}/:id`,
      zodValidator(deleteBlog),
      verifyUser,
      this.blogService.deleteById
    );
    this.router.put(
      `${this.path}/:id`,
      zodValidator(updateBlog),
      verifyUser,
      this.blogService.updateById
    );
  }
}

module.exports = { BlogController };
