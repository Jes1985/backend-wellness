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

class BlogListAdminController {
  path = "/blog_list_admin";
  router = Router();
  blogService = new blogService();
  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get(`${this.path}/`, this.blogService.getBlogListAdmin);
  }
}

module.exports = { BlogListAdminController };
