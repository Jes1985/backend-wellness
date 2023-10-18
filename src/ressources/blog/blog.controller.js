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

class BlogController {
  path = "/blogs";
  router = Router();
  blogService = new blogService();
  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    // ceci est niveau de /post directement. Si tu regarde dans le code next c'est au niveau de api/post/route. Alors que les autres sont dans api/post/[id]/route. Du genre les autres prennent un param Id.
    this.router.post(
      `${this.path}/`,
      zodValidator(createBlog),
      this.blogService.getById
    );
    // Ceci aussi est au niveau de /post/route directement. On ne passe pas de param donc j'ai pas mis :id, Du genre ceci c'est pour recuperer tous les blogs.
    this.router.get(`${this.path}/`, this.blogService.getAll);

    // ce GET c'est pour recup un bog par son Id en  fait. Genre on veut recuper un seul blog quoi. Tu sais qu ele Id est unique non
    this.router.get(
      `${this.path}/:id`,
      zodValidator(getBlog),
      this.blogService.getById
    );
    this.router.delete(
      `${this.path}/:id`,
      zodValidator(deleteBlog),
      this.blogService.deleteById
    );
    this.router.put(
      `${this.path}/:id`,
      zodValidator(updateBlog),
      this.blogService.updateById
    );
  }
}

module.exports = { BlogController };
