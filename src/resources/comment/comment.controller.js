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
const verifyUser = require("../../middleware/verifyUser");
const Stripe = require('stripe');


class CommentController {
  path = "/comments";
  router = Router();
  commentService = new commentService();
  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {

    this.router.get(`${this.path}/seller_comments/`, verifyUser, this.commentService.getSellerComments);

    this.router.get(`${this.path}/user_comments/`, verifyUser, this.commentService.getUserComments);

    this.router.get(`${this.path}/user_rating/`, verifyUser, this.commentService.getUserRating);


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
      verifyUser,
      this.commentService.updateById
    );
  }
}

module.exports = { CommentController };
