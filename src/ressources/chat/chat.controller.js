const { Router } = require("express");
const chatService = require("./chat.service");
const {
  getChat,
  deleteChat,
  updateChat,
  createChat,
} = require("./chat.validation");
const { jsonResponse } = require("../../utils/jsonResponse.util");
const logger = require("./../../config/logger");
const zodValidator = require("../../middleware/zod.middleware");

class ChatController {
  path = "/chats";
  router = Router();
  chatService = new chatService();
  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get(`${this.path}/listuser/`, this.chatService.listUser);

    this.router.get(`${this.path}/`, this.chatService.getAll);

    this.router.post(`${this.path}/`, this.chatService.create);

    this.router.put(`${this.path}/`, this.chatService.update);

    this.router.get(
      `${this.path}/:id`,
      zodValidator(getChat),
      this.chatService.getById
    );

    this.router.put(
      `${this.path}/:id`,
      zodValidator(updateChat),
      this.chatService.updateById
    );
  }
}

module.exports = { ChatController };
