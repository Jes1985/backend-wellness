const Order = require("./order.model");
const Chat = require("../chat/chat.model");
const Service = require("../service/service.model");
const HttpException = require("../../utils/exceptions/http.exception");
const { dbConnect } = require("../../config/dbConnect");

dbConnect();

const ERROR_MESSAGES = {
  CREATION_ERROR: "Erreur de donnée",
};

class OrderService {
  Order = Order;

  async getById(req, res, next) {
    const session = req.user;

    if (session) {
      const id = req.params.id;
      try {
        const oder = await Order.findByIdAndUpdate(
          id,
          {
            ispaid: true,
          },
          { new: true }
        );

        return new Response(JSON.stringify(oder), { status: 201 });
      } catch (error) {
        console.log(error);
        return new Response("Erreur de creation de commande", { status: 500 });
      }
    } else {
      return new Response(
        "Vous devez vous connecter pour effectuer cette action",
        { status: 401 }
      );
    }
  }

  async updateById(req, res, next) {
    const session = req.user;

    if (session) {
      const id = req.params.id;
      try {
        const oder = await Order.findById(id)
          .populate("serviceId")
          .populate("sellerId", "username");

        // if (oder.sellerId._id.toString() !== session.id) {
        //   throw new Error(`Erreur: Vous n'etes pas autorisé a effectuer cette opération`);
        // }

        return new Response(JSON.stringify(oder), { status: 201 });
      } catch (error) {
        console.log(error);
        return new Response(`Erreur s'est produite`, { status: 500 });
      }
    } else {
      return new Response(
        "Vous devez vous connecter pour effectuer cette action",
        { status: 401 }
      );
    }
  }

  async create(req, res, next) {
    const session = req.user;

    if (session) {
      const { cart, FirstName, LastName, AddressLine1, Email } =
        await req.json();

      let serviceCust = [];

      serviceCust.push(cart.costumservice.map((option) => option.option));

      try {
        const oder = new Order({
          user: session.id,
          serviceId: cart.serviceId,
          sellerId: cart.sellerId,
          price: cart.price,
          delai: cart.delai,
          costumservice: serviceCust.shift(),
          clientName: LastName,
          clientFirstName: FirstName,
          clientAddresse: AddressLine1,
          clientEmail: Email,
        });

        await oder.save();
        return new Response(JSON.stringify(oder), { status: 201 });
      } catch (error) {
        console.log(error);
        return new Response("Erreur de creation de commande", { status: 500 });
      }
    } else {
      return new Response(
        "Vous devez vous connecter pour effectuer cette action",
        { status: 401 }
      );
    }
  }

  async getAll(req, res, next) {
    const session = req.user;

    if (session) {
      try {
        const { searchParams } = new URL(req.url);
        const limit = 4;
        const page = searchParams.get("page") || 1;
        const skip = (page - 1) * limit;

        const total = await Order.countDocuments({
          // sellerId: session.id,
          // ispaid: true,
        });

        const pages = Math.floor(total / limit) + (total % limit > 0 ? 1 : 0);

        const oder = await Order.find({
          // ispaid: true,
          // sellerId: session.id
        })
          .populate("sellerId", "username")
          .skip(skip)
          .limit(limit)
          .populate("serviceId")
          .sort({ createdAt: -1 });

        return new Response(JSON.stringify({ oder, pages, total }), {
          status: 201,
        });
      } catch (error) {
        console.log(error);
        return new Response("Erreur de creation de commande", { status: 500 });
      }
    } else {
      return new Response(
        "Vous devez vous connecter pour effectuer cette action",
        { status: 401 }
      );
    }
  }

  async getAddOptions(req, res, next) {
    const session = req.user;

    if (session) {
      const id = req.params.id;
      try {
        const order = await Order.findById(id);
        if (order.user.toString() !== session.id) {
          throw new Error(
            `Erreur:vous n'etes pas autorisé a modifier cette commande`,
            { status: 404 }
          );
        }

        if (order.optionpement.ispaid) {
          throw new Error(
            `Desolé, vous ne pouvez pas modifier plus de 1 fois votre commande`,
            { status: 404 }
          );
        }
        const service = await Service.findById(order.serviceId);
        return new Response(JSON.stringify({ order, service }), {
          status: 201,
        });
      } catch (error) {
        return new Response(error, { status: 500 });
      }
    } else {
      return new Response(
        "Vous devez vous connecter pour effectuer cette action",
        { status: 401 }
      );
    }
  }

  async updateAddOptions(req, res, next) {
    const session = req.user;

    const { options, totalPrice } = await req.json();

    let serviceCust = [];

    serviceCust.push(options.map((option) => option.option));

    const option = options.map((option) => option.option);

    if (session) {
      const id = req.params.id;
      try {
        const oder = await Order.findByIdAndUpdate(
          id,
          {
            $push: { costumservice: option },
            $inc: { price: totalPrice },
            $set: { "optionpement.amount": totalPrice },
          },
          { new: true }
        );

        return new Response(JSON.stringify(oder), { status: 201 });
      } catch (error) {
        console.log(error);
        return new Response("Erreur de creation de commande", { status: 500 });
      }
    } else {
      return new Response(
        "Vous devez vous connecter pour effectuer cette action",
        { status: 401 }
      );
    }
  }

  async getAllOrder(req, res, next) {
    const session = req.user;

    const { searchParams } = new URL(req.url);

    const limit = 6;
    const page = searchParams.get("page") || 1;
    const skip = (page - 1) * limit;

    if (session) {
      try {
        const oder = await Order.find({ user: session.id, ispaid: true })
          .populate("sellerId", "username")
          .skip(skip)
          .limit(limit)
          .populate("serviceId")
          .sort({ createdAt: -1 });

        const total = await Order.countDocuments({
          user: session.id,
          ispaid: true,
        });

        const pages = Math.floor(total / limit) + (total % limit > 0 ? 1 : 0);

        return new Response(JSON.stringify({ oder, total, pages }), {
          status: 201,
        });
      } catch (error) {
        console.log(error);
        return new Response("Erreur de creation de commande", { status: 500 });
      }
    } else {
      return new Response(
        "Vous devez vous connecter pour effectuer cette action",
        { status: 401 }
      );
    }
  }

  async updateOptions(req, res, next) {
    const session = req.user;

    if (session) {
      const id = req.params.id;
      try {
        const oder = await Order.findByIdAndUpdate(
          id,
          {
            $set: { "optionpement.ispaid": true },
          },
          { new: true }
        );

        return new Response(JSON.stringify(oder), { status: 201 });
      } catch (error) {
        console.log(error);
        return new Response("Erreur de creation de commande", { status: 500 });
      }
    } else {
      return new Response(
        "Vous devez vous connecter pour effectuer cette action",
        { status: 401 }
      );
    }
  }

  async getProfilStat(req, res, next) {
    const id = req.params.id;
    try {
      const Ordercomplete = await Order.countDocuments({
        ispaid: true,
        sellerId: id,
        isCompleted: true,
      });

      const OderPending = await Order.countDocuments({
        sellerId: id,
        isCompleted: false,
        ispaid: true,
      });

      const response = await Chat.aggregate([
        {
          $match: {
            $or: [{ sender: id }, { recipient: id }],
          },
        },
        {
          $sort: { createdAt: 1 },
        },
        {
          $group: {
            _id: null,
            totalResponseTime: {
              $sum: { $subtract: ["$createdAt", "$prevCreatedAt"] },
            },
            numberOfResponses: { $sum: 1 },
            prevCreatedAt: { $last: "$createdAt" },
          },
        },
        {
          $project: {
            _id: 0,
            averageResponseTimeInSeconds: {
              $cond: [
                { $gt: ["$numberOfResponses", 0] },
                {
                  $divide: [
                    { $toLong: "$totalResponseTime" },
                    { $multiply: ["$numberOfResponses", 1000] },
                  ],
                },
                0,
              ],
            },
          },
        },
        {
          $project: {
            averageResponseTime: {
              $cond: [
                { $gte: ["$averageResponseTimeInSeconds", 60] }, // Greater than or equal to 1 minute
                {
                  $cond: [
                    { $gte: ["$averageResponseTimeInSeconds", 3600] }, // Greater than or equal to 1 hour
                    {
                      $cond: [
                        { $gte: ["$averageResponseTimeInSeconds", 86400] }, // Greater than or equal to 1 day
                        {
                          $concat: [
                            {
                              $toString: {
                                $divide: [
                                  "$averageResponseTimeInSeconds",
                                  86400,
                                ],
                              },
                            },
                            " jours",
                          ],
                        },
                        {
                          $concat: [
                            {
                              $toString: {
                                $divide: [
                                  "$averageResponseTimeInSeconds",
                                  3600,
                                ],
                              },
                            },
                            " heures",
                          ],
                        },
                      ],
                    },
                    {
                      $concat: [
                        {
                          $toString: {
                            $divide: ["$averageResponseTimeInSeconds", 60],
                          },
                        },
                        " minutes",
                      ],
                    },
                  ],
                },
                {
                  $concat: [
                    { $toString: "$averageResponseTimeInSeconds" },
                    " secondes",
                  ],
                },
              ],
            },
          },
        },
      ]);

      if (response.length === 0) {
        return new Response(
          JSON.stringify({
            Ordercomplete,
            OderPending,
            averageResponseTime: `Pas d'échange`,
          }),
          {
            status: 201,
          }
        );
      } else {
        const { averageResponseTime } = response[0];
        return new Response(
          JSON.stringify({ Ordercomplete, OderPending, averageResponseTime }),
          {
            status: 201,
          }
        );
      }
    } catch (error) {
      return new Response("Erreur, aucune commande trouvé", { status: 500 });
    }
  }

  async getSellerStat(req, res, next) {
    const session = req.user;

    const id = req.params.id;
    try {
      const service = await Service.findById(id);
      const Ordercomplete = await Order.countDocuments({
        ispaid: true,
        sellerId: service.user,
        isCompleted: true,
      });

      const OderPending = await Order.countDocuments({
        sellerId: service.user,
        isCompleted: false,
        ispaid: true,
      });

      const response = await Chat.aggregate([
        {
          $match: {
            $or: [{ sender: service.user }, { recipient: service.user }],
          },
        },
        {
          $sort: { createdAt: 1 },
        },
        {
          $group: {
            _id: null,
            totalResponseTime: {
              $sum: { $subtract: ["$createdAt", "$prevCreatedAt"] },
            },
            numberOfResponses: { $sum: 1 },
            prevCreatedAt: { $last: "$createdAt" },
          },
        },
        {
          $project: {
            _id: 0,
            averageResponseTimeInSeconds: {
              $cond: [
                { $gt: ["$numberOfResponses", 0] },
                {
                  $divide: [
                    { $toLong: "$totalResponseTime" },
                    { $multiply: ["$numberOfResponses", 1000] },
                  ],
                },
                0,
              ],
            },
          },
        },
        {
          $project: {
            averageResponseTime: {
              $cond: [
                { $gte: ["$averageResponseTimeInSeconds", 60] }, // Greater than or equal to 1 minute
                {
                  $cond: [
                    { $gte: ["$averageResponseTimeInSeconds", 3600] }, // Greater than or equal to 1 hour
                    {
                      $cond: [
                        { $gte: ["$averageResponseTimeInSeconds", 86400] }, // Greater than or equal to 1 day
                        {
                          $concat: [
                            {
                              $toString: {
                                $divide: [
                                  "$averageResponseTimeInSeconds",
                                  86400,
                                ],
                              },
                            },
                            " jrs",
                          ],
                        },
                        {
                          $concat: [
                            {
                              $toString: {
                                $divide: [
                                  "$averageResponseTimeInSeconds",
                                  3600,
                                ],
                              },
                            },
                            " h",
                          ],
                        },
                      ],
                    },
                    {
                      $concat: [
                        {
                          $toString: {
                            $divide: ["$averageResponseTimeInSeconds", 60],
                          },
                        },
                        " mins",
                      ],
                    },
                  ],
                },
                {
                  $concat: [
                    { $toString: "$averageResponseTimeInSeconds" },
                    " secs",
                  ],
                },
              ],
            },
          },
        },
      ]);
      const { averageResponseTime } = response[0];

      if (averageResponseTime === "0 secs") {
        return new Response(
          JSON.stringify({
            Ordercomplete,
            OderPending,
            averageResponseTime: `Pas d'échange`,
          }),
          {
            status: 201,
          }
        );
      } else {
        return new Response(
          JSON.stringify({ Ordercomplete, OderPending, averageResponseTime }),
          {
            status: 201,
          }
        );
      }
    } catch (error) {
      return new Response("Erreur, aucune commande trouvé", { status: 500 });
    }
  }

  async getServices(req, res, next) {
    const session = req.user;

    if (session) {
      const id = req.params.id;
      try {
        const oder = await Order.findById(id)
          .populate("serviceId")
          .populate("sellerId", "username");

        // if (oder.sellerId._id.toString() !== session.id) {
        //   throw new Error(`Erreur: Vous n'etes pas autorisé a effectuer cette opération`);
        // }

        return new Response(JSON.stringify(oder), { status: 201 });
      } catch (error) {
        console.log(error);
        return new Response("Erreur, aucune commande trouvé", { status: 500 });
      }
    } else {
      return new Response(
        "Vous devez vous connecter pour effectuer cette action",
        { status: 401 }
      );
    }
  }

  async getStats(req, res, next) {
    const session = req.user;

    if (session) {
      try {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const startOfYear = new Date(currentYear, 0, 1);

        const order = await Order.countDocuments({
          sellerId: session.id,
          isCompleted: false,
        });

        const finishedOrder = await Order.countDocuments({
          sellerId: session.id,
          isCompleted: true,
        });

        const monthlyRevenue = await Order.aggregate([
          {
            $match: {
              createdAt: {
                $gte: startOfYear,
                $lte: new Date(currentYear, currentDate.getMonth(), 31),
              },
              isCompleted: true,
              sellerId: session.id,
            },
          },
          {
            $group: {
              _id: { $month: "$createdAt" },
              revenue: { $sum: "$price" },
            },
          },
          {
            $sort: {
              _id: 1,
            },
          },
        ]);

        const monthLabels = monthlyRevenue.map((entry) =>
          new Date(currentYear, entry._id - 1).toLocaleString("default", {
            month: "short",
          })
        );

        const revenueData = monthlyRevenue.map((entry) => entry.revenue);

        const yearlyRevenue = await Order.aggregate([
          {
            $match: {
              createdAt: {
                $gte: startOfYear,
                $lte: currentDate,
              },
              isCompleted: true,
              sellerId: session.id,
            },
          },
          {
            $group: {
              _id: null,
              revenue: { $sum: "$price" },
            },
          },
        ]);

        const totalYearlyRevenue =
          yearlyRevenue.length > 0 ? yearlyRevenue[0].revenue : 0;

        return new Response(
          JSON.stringify({
            yearlyRevenue: totalYearlyRevenue,
            monthlyRevenue: revenueData,
            monthLabels,
            order,
            finishedOrder,
          }),
          {
            status: 201,
          }
        );
      } catch (error) {
        console.error(error);
        return new Response("Erreur de recherche de commande", { status: 500 });
      }
    } else {
      return new Response(
        "Vous devez vous connecter pour effectuer cette action",
        { status: 401 }
      );
    }
  }

  async updateStatus(req, res, next) {
    const session = req.user;

    const { status } = await req.json();

    if (session) {
      const id = req.params.id;
      try {
        const oder = await Order.findByIdAndUpdate(
          id,
          {
            status: status,
          },
          { new: true }
        );

        return new Response(JSON.stringify(oder), { status: 201 });
      } catch (error) {
        console.log(error);
        return new Response("Erreur de creation de commande", { status: 500 });
      }
    } else {
      return new Response(
        "Vous devez vous connecter pour effectuer cette action",
        { status: 401 }
      );
    }
  }

  async getOrderstats(req, res, next) {
    const session = req.user;

    if (session) {
      try {
        const year = new Date().getUTCFullYear();

        const ventesParMois = await Order.aggregate([
          {
            $match: {
              createdAt: {
                $gte: new Date(year, 0, 1), // Date de début de l'année en cours
                $lt: new Date(year + 1, 0, 1), // Date de début de l'année suivante
              },
              sellerId: session.id,
            },
          },
          {
            $group: {
              _id: { $month: "$createdAt" },
              totalSales: { $sum: { $toDouble: "$price" } },
            },
          },
          {
            $sort: {
              _id: 1, // Triez les résultats par mois dans l'ordre croissant (de janvier à décembre)
            },
          },
        ]);

        const moisAbreges = ventesParMois.map((vente) => {
          const mois = new Date(year, vente._id - 1, 1).toLocaleString(
            "default",
            { month: "short" }
          );
          return mois.substring(0, 3);
        });

        const montantVentes = ventesParMois.map((vente) => vente.totalSales);

        const currentDate = new Date(); // Date en cours
        currentDate.setUTCHours(0, 0, 0, 0);

        const previousDayEnd = new Date(currentDate);
        previousDayEnd.setUTCDate(previousDayEnd.getDate() - 1); // Date du jour précédent

        const previousDayStart = new Date(previousDayEnd);
        previousDayStart.setUTCDate(previousDayStart.getDate() - 1); // Date du jour précédent du jour précédent

        // Agrégation des ventes pour la semaine en cours
        const currentDaySales = await Order.aggregate([
          {
            $match: {
              createdAt: {
                $gte: previousDayEnd,
                $lt: currentDate,
              },
              sellerId: session.id,
            },
          },
          {
            $group: {
              _id: null,
              totalSales: { $sum: { $toDouble: "$price" } },
            },
          },
        ]);

        // Agrégation des ventes pour la semaine précédente
        const previousDaySales = await Order.aggregate([
          {
            $match: {
              createdAt: {
                $gte: previousDayStart,
                $lt: previousDayEnd,
              },
              sellerId: session.id,
            },
          },
          {
            $group: {
              _id: null,
              totalSales: { $sum: { $toDouble: "$price" } },
            },
          },
        ]);

        // Calcul de la différence en pourcentage
        const currentDayTotalSales =
          currentDaySales.length > 0 ? currentDaySales[0].totalSales : 0;
        const previousDayTotalSales =
          previousDaySales.length > 0 ? previousDaySales[0].totalSales : 0;

        const differencePercentage = () => {
          if (previousDayTotalSales === 0) {
            return "N/A";
          }

          const differencePercentage = (
            ((currentDayTotalSales - previousDayTotalSales) /
              previousDayTotalSales) *
            100
          ).toFixed(2);
          return parseFloat(differencePercentage);
        };

        // Détermination du statut
        let status = "";
        if (differencePercentage > 0) {
          status = "augmentation";
        } else if (differencePercentage < 0) {
          status = "baisse";
        } else {
          status = "stable";
        }

        const weekStat = {
          currentDayTotalSales,
          previousDayTotalSales,
          differencePercentage,
          status,
        };

        return new Response(
          JSON.stringify({ moisAbreges, montantVentes, weekStat }),
          {
            status: 200,
          }
        );
      } catch (error) {
        console.log("erreur", error);
        return new Response("Internal Server Error", { status: 500 });
      }
    }
  }
}

module.exports = OrderService;
