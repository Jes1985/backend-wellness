const { Router } = require("express");
const commentService = require("./comment.service");
const {
  getComment,
  deleteComment,
  updateComment,
  createComment,
} = require("./comment.validation");
const { jsonResponse } = require("../../utils/jsonResponse.util");
const logger = require("../../config/logger");
const zodValidator = require("../../middleware/zod.middleware");

class CommentController {
  path = "/comments";
  router = Router();
  commentService = new commentService();
  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {

    this.router.get(`${this.path}/seller_comments/`, this.commentService.getSellerComments);

    this.router.get(`${this.path}/user_comments/`, this.commentService.getUserComments);

    this.router.get(`${this.path}/user_rating/`, this.commentService.getUserRating);


    this.router.get(
      `${this.path}/:id`,
      zodValidator(getComment),
      this.commentService.getById
    );
    this.router.delete(
      `${this.path}/:id`,
      zodValidator(deleteComment),
      this.commentService.deleteById
    );
    this.router.put(
      `${this.path}/:id`,
      zodValidator(updateComment),
      this.commentService.updateById
    );
  }
}

module.exports = { CommentController };
