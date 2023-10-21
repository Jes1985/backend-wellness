const Chat = require("../chat/chat.model");
const Order = require("../orders/order.model");
const Service = require("../service/service.model");
const HttpException = require("../../utils/exceptions/http.exception");
const { dbConnect } = require("../../config/dbConnect");

dbConnect();

const ERROR_MESSAGES = {
  CREATION_ERROR: "Erreur de donnée",
};

class CommentService {
  Comment = Comment;

  async updateById(req, res, next) {
    const session = req.user;

    if (!session) {
      throw new Error("Vous devez vous connecter pour effectuer cette action");
    }
    try {
      const id = req.params.id;
      const { userId, name, text, star } = await req.json();

      const getOdre = await Order.findOne({ user: session.id, _id: id });

      if (!getOdre) {
        throw new Error(`Vous n'etes pas autorisé à effectuer cette action`);
      }

      // Rechercher la commande correspondante
      const order = await Order.findByIdAndUpdate(
        id,
        {
          $set: { isApproved: true },
        },
        { new: true }
      );
      if (!order) {
        throw new Error(`Commande non trouvée`);
      }

      // Rechercher le service correspondant
      const service = await Service.findById(order.serviceId);
      if (!service) {
        throw new Error(`Service non trouvé`);
      }

      // Vérifier si l'utilisateur a déjà évalué ce service
      const existingComment = service.comment.find(
        (comment) => comment.user.toString() === session.id
      );

      if (existingComment) {
        // Mettre à jour le commentaire existant
        const starDifference = star - existingComment.star;
        existingComment.text = text;
        existingComment.star = star;

        // Mettre à jour la moyenne des évaluations
        const totalRating = service.rating * service.numberOfRating;
        const newTotalRating = totalRating + starDifference;
        service.rating = newTotalRating / service.numberOfRating;
      } else {
        // Créer un nouvel objet commentaire
        const newComment = {
          user: session.id,
          name: session.username,
          text,
          star,
        };

        // Ajouter le commentaire à la liste des commentaires du service
        service.comment.push(newComment);

        // Mettre à jour la moyenne des évaluations en prenant en compte le nouvel avis
        const totalRating = service.rating * service.numberOfRating;
        const newTotalRating = totalRating + star;
        service.rating = newTotalRating / (service.numberOfRating + 1);

        // Incrémenter le nombre d'évaluations
        service.numberOfRating += 1;
      }

      // Sauvegarder les modifications du service
      await service.save();

      const chat = new Chat({
        sender: session.id,
        content: `Service ${order._id} a été approuvé par ${session.username}`,
        recipient: order.sellerId,
      });
      await chat.save();

      const paymentIntent = await stripe.paymentIntents.retrieve(
        order.payementId
      );

      if (paymentIntent.status !== "succeeded") {
        await stripe.paymentIntents.capture(order.payementId);
      }

      if (order.optionpement && order.optionpement.ispaid) {
        const payment = await stripe.paymentIntents.retrieve(
          order.optionpement.id
        );
        if (payment.status !== "succeeded") {
          await stripe.paymentIntents.capture(order.optionpement.id);
        }
      }

      return new Response(JSON.stringify(service), {
        status: 200,
      });
    } catch (error) {
      console.log(error);
      return new Response("Erreur de serveur", { status: 500 });
    }
  }

  async deleteById(req, res, next) {
    try {
      const { serviceId, commentId } = req.params.id;
      const { userId } = await req.json();

      // Rechercher le service correspondant
      const service = await Service.findById(serviceId);

      if (!service) {
        throw new Error(`Service non trouvé`);
      }

      // Vérifier si le commentaire existe et s'il appartient à l'utilisateur
      const comment = service.comment.find(
        (c) => c._id.toString() === commentId && c.user.toString() === userId
      );

      if (!comment) {
        return res.status(404).json({ message: "Commentaire non trouvé" });
      }

      // Supprimer le commentaire de la liste des commentaires du service
      service.comment = service.comment.filter(
        (c) => c._id.toString() !== commentId
      );

      // Mettre à jour la moyenne des évaluations en prenant en compte la suppression du commentaire
      const totalRating = service.rating * service.numberOfRating;
      const newTotalRating = totalRating - comment.star;
      service.rating =
        service.numberOfRating > 1
          ? newTotalRating / (service.numberOfRating - 1)
          : 0;
      service.numberOfRating -= 1;

      // Sauvegarder les modifications du service
      await service.save();
      return new Response(JSON.stringify(service), {
        status: 201,
      });
    } catch (error) {
      console.log(error);
      return new Response("Erreur de suppression du commentaire", {
        status: 500,
      });
    }
  }

  async getById(req, res, next) {
    try {
      const session = await getUseSession();
      const id = req.params.id;
      const order = await Order.findById(id);

      // Rechercher le service correspondant
      const service = await Service.findById(order.serviceId);
      if (!service) {
        throw new Error(`Service non trouvé`);
      }

      // Rechercher le commentaire de l'utilisateur pour le service
      const userComment = service.comment.find(
        (comment) => comment.user.toString() === session.id
      );

      // Le commentaire de l'utilisateur existe
      return new Response(JSON.stringify(userComment), {
        status: 200,
      });
    } catch (error) {
      console.log(error);
      return new Response("Erreur de serveur", { status: 500 });
    }
  }

  async getSellerComments(req, res, next) {
    const session = req.user;

    if (session) {
      try {
        const comments = await Service.aggregate([
          // Étape 1 : Faire correspondre les services de l'utilisateur avec les commentaires
          {
            $match: { user: session.id },
          },
          // Étape 2 : Déplier les commentaires
          {
            $unwind: "$comment",
          },
          // Étape 3 : Rechercher l'utilisateur associé à chaque commentaire
          {
            $lookup: {
              from: "users",
              localField: "comment.user",
              foreignField: "_id",
              as: "user",
            },
          },
          // Étape 4 : Supprimer les champs indésirables de l'utilisateur
          {
            $project: {
              _id: 0,
              "comment._id": 1,
              "comment.text": 1,
              "comment.star": 1,
              "user._id": 1,
              "user.username": 1,
              "user.email": 1,
              "user.image": 1,
            },
          },
        ]);
        return new Response(JSON.stringify(comments), {
          status: 200,
        });
      } catch (error) {
        console.log(error);
        return new Response("Erreur de serveur", { status: 500 });
      }
    } else {
      return new Response(
        "Vous devez vous connecter pour effectuer cette action",
        { status: 401 }
      );
    }
  }

  async getUserComments(req, res, next) {
    const session = req.user;

    if (session) {
      try {
        const serviceCommentCount = await Service.aggregate([
          {
            $match: {
              user: session.id,
            },
          },
          {
            $group: {
              _id: null,
              totalComments: { $sum: { $size: "$comment" } },
            },
          },
        ]);

        const totalComments =
          serviceCommentCount.length > 0
            ? serviceCommentCount[0].totalComments
            : 0;

        return new Response(JSON.stringify(totalComments), {
          status: 200,
        });
      } catch (error) {
        console.log(error);
        return new Response("Erreur de serveur", { status: 500 });
      }
    } else {
      return new Response(
        "Vous devez vous connecter pour effectuer cette action",
        { status: 401 }
      );
    }
  }

  async getUserRating(req, res, next) {
    const session = req.user;

    if (session) {
      try {
        const positiveReview = await Service.countDocuments({
          user: session.id,
          "comment.star": { $gte: 3 },
        });

        const negativeReviews = await Service.countDocuments({
          user: session.id,
          "comment.star": { $lt: 3 },
        });

        const totalComments = await Service.aggregate([
          {
            $match: { user: session.id },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$numberOfRating" },
            },
          },
        ]);

        const totalRating =
          totalComments.length > 0 ? totalComments[0].total : 0;

        console.log({ positiveReview, negativeReviews, totalRating });

        return new Response(
          JSON.stringify({
            positiveReview,
            negativeReviews,
            totalRating,
          }),
          {
            status: 200,
          }
        );
      } catch (error) {
        console.log(error);
        return new Response("Erreur de serveur", { status: 500 });
      }
    } else {
      return new Response(
        "Vous devez vous connecter pour effectuer cette action",
        { status: 401 }
      );
    }
  }
}

module.exports = CommentService;

// async getSellerComments(req, res, next) {
//   const session = req.user
// }
