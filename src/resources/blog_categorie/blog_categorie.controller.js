const { Router } = require("express");
const blogService = require("../blog/blog.service");
const {
  getBlog,
  deleteBlog,
  updateBlog,
  createBlog,
} = require("../blog/blog.validation");
const { jsonResponse } = require("../../utils/jsonResponse.util");
const logger = require("./../../config/logger");
const zodValidator = require("../../middleware/zod.middleware");

class BlogCategoryController {
  path = "/blog_categorie";
  router = Router();
  blogService = new blogService();
  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get(`${this.path}/`, this.blogService.getBlogCategory);
  }
}

module.exports = { BlogCategoryController };
