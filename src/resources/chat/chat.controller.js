const { Router } = require("express");
const chatService = require("./chat.service");
const { createChat, getChat, updateChat } = require("./chat.validation");
const { jsonResponse } = require("../../utils/jsonResponse.util");
const logger = require("./../../config/logger");
const zodValidator = require("../../middleware/zod.middleware");
const verifyUser = require("../../middleware/verifyUser");

class ChatController {
  path = "/chats";
  router = Router();
  chatService = new chatService();
  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get(
      `${this.path}/listuser/`,
      verifyUser,
      this.chatService.listUser
    );

    this.router.get(`${this.path}/`, verifyUser, this.chatService.getAll);

    this.router.post(
      `${this.path}/`,
      zodValidator(createChat),
      verifyUser,
      this.chatService.create
    );

    this.router.put(
      `${this.path}/`,
      verifyUser,
      this.chatService.update
    );

    this.router.get(
      `${this.path}/:id`,
      zodValidator(getChat),
      verifyUser,
      this.chatService.getById
    );

    this.router.put(
      `${this.path}/:id`,
      zodValidator(updateChat),
      verifyUser,
      this.chatService.updateById
    );
  }
}

module.exports = { ChatController };
