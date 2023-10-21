const Chat = require("./chat.model");
const User = require("../user/user.model");
const { jsonResponse } = require("../../utils/jsonResponse.util");
const HttpException = require("../../utils/exceptions/http.exception");
const { dbConnect } = require("../../config/dbConnect");

const ERROR_MESSAGES = {
  CREATION_ERROR: "Erreur de donnée",
};

class ChatService {
  Chat = Chat;

  async listUser(req, res, next) {
    const session = req.user;

    if (session) {
      try {
        const senderList = await Chat.distinct("sender", {
          recipient: session.id,
        });

        const users = await User.aggregate([
          {
            $match: { _id: { $in: senderList } },
          },
          {
            $lookup: {
              from: "profils",
              localField: "_id",
              foreignField: "user",
              as: "profile",
            },
          },
          {
            $unwind: { path: "$profile", preserveNullAndEmptyArrays: true },
          },
          {
            $lookup: {
              from: "chats",
              let: { userId: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $or: [
                        {
                          $and: [
                            { $eq: ["$sender", "$$userId"] },
                            { $eq: ["$recipient", session.id] },
                          ],
                        },
                        {
                          $and: [
                            { $eq: ["$sender", session.id] },
                            { $eq: ["$recipient", "$$userId"] },
                          ],
                        },
                      ],
                    },
                  },
                },
                { $sort: { createdAt: -1 } },
                { $limit: 1 },
                {
                  $project: {
                    sender: 1,
                    recipient: 1,
                    content: 1,
                    isRead: 1,
                    createdAt: 1,
                  },
                },
              ],
              as: "lastMessage",
            },
          },
          {
            $unwind: { path: "$lastMessage", preserveNullAndEmptyArrays: true },
          },
          {
            $project: {
              _id: 1,
              username: 1,
              email: 1,
              "profile.profil": 1,
              "profile.banner": 1,
              "profile.bio": 1,
              createdAt: 1,
              updatedAt: 1,
              lastMessage: 1,
            },
          },
          {
            $group: {
              _id: "$_id",
              data: {
                $first: "$$ROOT",
              },
            },
          },
          {
            $replaceRoot: { newRoot: "$data" },
          },
          {
            $sort: { "lastMessage.createdAt": -1 },
          },
        ]);

        return res.json(jsonResponse(JSON.stringify(users), { status: 201 }));
      } catch (error) {
        console.log(error);
        return res.json(jsonResponse("Erreur de serveur", { status: 500 }));
      }
    } else {
      return res.json(
        jsonResponse("Vous devez vous connecter pour effectuer cette action", {
          status: 401,
        })
      );
    }
  }

  async getAll(req, res, next) {
    const session = req.user;

    if (session) {
      try {
        const isNotRead = await Chat.find({
          recipient: session.id,
        })
          .populate("sender", "username")
          .sort({ createdAt: -1 });

        const Chats = await Chat.find({});
        const total = await Chat.countDocuments({
          isRead: false,
          recipient: session.id,
        });
        return res.json(
          jsonResponse(JSON.stringify({ isNotRead, Chats, total }), {
            status: 201,
          })
        );
      } catch (error) {
        console.log(error);
        return res.json(
          jsonResponse("Erreur de creation de service", { status: 500 })
        );
      }
    } else {
      return res.json(
        jsonResponse("Vous devez vous connecter pour effectuer cette action", {
          status: 401,
        })
      );
    }
  }

  async create(req, res, next) {
    const session = req.user;

    if (session) {
      const { content, recipient } = await req.body;

      try {
        const chat = new Chat({
          sender: session.id,
          content,
          recipient,
        });

        await chat.save();
        const chatUser = await Chat.findById(chat._id).populate(
          "sender",
          "username"
        );
        return res.json(
          jsonResponse(JSON.stringify(chatUser), { status: 201 })
        );
      } catch (error) {
        console.log(error);
        return res.json(
          jsonResponse("Erreur de creation de service", { status: 500 })
        );
      }
    } else {
      return res.json(
        jsonResponse("Vous devez vous connecter pour effectuer cette action", {
          status: 401,
        })
      );
    }
  }

  async update(req, res, next) {
    const session = req.user;

    if (session) {
      try {
        const filter = { isRead: false, recipient: session.id };
        const update = { $set: { isRead: true } };
        const result = await Chat.updateMany(filter, update);
        return res.json(
          jsonResponse(JSON.stringify(result), {
            status: 201,
          })
        );
      } catch (error) {
        console.log(error);
        return res.json(
          jsonResponse("Erreur de creation de service", { status: 500 })
        );
      }
    } else {
      return res.json(
        jsonResponse("Vous devez vous connecter pour effectuer cette action", {
          status: 401,
        })
      );
    }
  }

  async getById(req, res, next) {
    const session = req.user;

    const id = req.params.id;

    if (session) {
      try {
        const Chats = await Chat.find({
          $or: [
            { recipient: id, sender: session.id },
            { recipient: session.id, sender: id },
          ],
        })
          .populate("sender", "username")
          .sort({ createdAt: 1 });

        return res.json(
          jsonResponse(JSON.stringify(Chats), {
            status: 201,
          })
        );
      } catch (error) {
        console.log(error);
        return res.json(
          jsonResponse("Erreur de creation de service", { status: 500 })
        );
      }
    } else {
      return res.json(
        jsonResponse("Vous devez vous connecter pour effectuer cette action", {
          status: 401,
        })
      );
    }
  }

  async updateById(req, res, next) {
    const session = req.user;

    if (session) {
      try {
        const chat = await Chat.findByIdAndUpdate(
          req.params.id,
          {
            $set: {
              isRead: true,
            },
          },
          { new: true }
        );
        return res.json(jsonResponse(JSON.stringify(chat), { status: 201 }));
      } catch (error) {
        console.log(error);
        return res.json(jsonResponse("Erreur de mise a jour", { status: 500 }));
      }
    } else {
      return res.json(
        jsonResponse("Vous devez vous connecter pour effectuer cette action", {
          status: 401,
        })
      );
    }
  }

  async getAllChatUser(req, res, next) {
    const session = req.user;

    if (session) {
      try {
        const Chats = await Chat.find({
          $or: [{ recipient: session.id }, { sender: session.id }],
        })
          .populate("sender", "username")
          .limit(8);

        const total = await Chat.countDocuments({
          $or: [{ recipient: session.id }, { sender: session.id }],
        });

        return res.json(
          jsonResponse(JSON.stringify({ Chats, total }), {
            status: 201,
          })
        );
      } catch (error) {
        console.log(error);
        return res.json(
          jsonResponse("Erreur de creation de service", { status: 500 })
        );
      }
    } else {
      return res.json(
        jsonResponse("Vous devez vous connecter pour effectuer cette action", {
          status: 401,
        })
      );
    }
  }
}

module.exports = ChatService;
