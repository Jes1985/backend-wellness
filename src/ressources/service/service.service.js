const Service = require("./service.model");
const HttpException = require("../../utils/exceptions/http.exception");
const { dbConnect } = require("../../config/dbConnect");

dbConnect();

const ERROR_MESSAGES = {
  CREATION_ERROR: "Erreur de donnée",
  NOT_LOGGED_IN: "Vous devez vous connecter pour effectuer cette opération",
  SERVICE_NOT_FOUND: "Aucun service trouvé",
  UNAUTHORIZED: `Vous n'êtes pas autorisé à effectuer cette opération`,
};

class ServiceService {
  Service = Service;

  async getById(req, res, next) {
    const session = req.user;

    try {
      const service = await Service.findById(req.params.id).populate("user");

      if (!service)
        return new Response("Aucun service trouvé", { status: 404 });

      const user = await User.findById(service.user._id).select("-password");

      // Associer le profil de l'utilisateur à chaque commentaire
      const populatedComments = await Promise.all(
        service.comment.map(async (comment) => {
          let commentUser = null;
          if (comment.user) {
            commentUser = await Profil.findOne({ user: comment.user }).populate(
              "user",
              "username"
            );
          }
          return { ...comment._doc, user: commentUser };
        })
      );

      // Mettre à jour les commentaires avec les profils des utilisateurs
      service.comment = populatedComments;

      // Récupérer le profil du vendeur
      const sellerProfile = await Profil.findOne({ user: service.user._id });

      const services = await Service.find({
        user: service.user._id,
        _id: { $ne: service._id },
      }).populate("user", "username email");

      // Associer le profil du vendeur à chaque service
      const populatedServices = await Promise.all(
        services.map(async (service) => {
          let sellerProfile = null;
          if (service.user) {
            sellerProfile = await Profil.findOne({
              user: service.user,
            }).populate("user", "username");
          }
          return { ...service._doc, profil: sellerProfile };
        })
      );

      return new Response(
        JSON.stringify({ service, services: populatedServices, user }),
        {
          status: 200,
        }
      );
    } catch (error) {
      return new Response("Internal Server Error", { status: 500 });
    }
  }

  async patchById(req, res, next) {
    const { category, souscategory, title } = await req.json();
    const session = await getUseSession();

    try {
      if (!session) {
        throw new Error(
          `Vous devez vous connecter pour effectuer cette opération`
        );
      }
      const existingService = await Service.findById(req.params.id);

      if (!existingService) {
        throw new Error("Aucun service trouvé", { status: 404 });
      }

      if (existingService.user.toString() !== session.id) {
        throw new Error(`Vous n'etes pas autorisé a effectuer cette opération`);
      }

      existingService.category = category;
      existingService.souscategory = souscategory;
      existingService.title = title;

      await existingService.save();

      return new Response(JSON.stringify(existingService), {
        status: 200,
      });
    } catch (error) {
      console.log(error);
      return new Response(error, { status: 500 });
    }
  }

  async updateById(req, res, next) {
    const session = req.user;

    try {
      // Vérifier si l'utilisateur est connecté
      if (!session) {
        throw new Error(ERROR_MESSAGES.NOT_LOGGED_IN);
      }

      const existingService = await Service.findById(req.params.id);
      // Vérifier si le service existe
      if (!existingService) {
        throw new Error(ERROR_MESSAGES.SERVICE_NOT_FOUND, { status: 404 });
      }

      // Vérifier si l'utilisateur est autorisé à modifier le service
      if (existingService.user.toString() !== session.id) {
        throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
      }

      const isPublish = !existingService.isPublish;

      const service = await Service.findByIdAndUpdate(req.params.id, {
        $set: { isPublish },
      });

      return new Response(JSON.stringify(service), {
        status: 200,
      });
    } catch (error) {
      console.log(error);
      return new Response(error, { status: 500 });
    }
  }

  async deleteById(req, res, next) {
    const session = req.user;

    try {
      // Vérifier si l'utilisateur est connecté
      if (!session) {
        throw new Error(ERROR_MESSAGES.NOT_LOGGED_IN);
      }

      const existingService = await Service.findById(req.params.id);
      // Vérifier si le service existe
      if (!existingService) {
        throw new Error(ERROR_MESSAGES.SERVICE_NOT_FOUND, { status: 404 });
      }

      // Vérifier si l'utilisateur est autorisé à supprimer le service
      if (existingService.user.toString() !== session.id) {
        throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
      }

      await Service.findByIdAndDelete(req.params.id);

      return new Response(
        JSON.stringify({ message: "Service supprimé avec succès" }),
        {
          status: 200,
        }
      );
    } catch (error) {
      console.log(error);
      return new Response(error, { status: 500 });
    }
  }

  async getAll(req, res, next) {
    const session = req.user;

    if (session && session && session.isAdmin) {
      try {
        const { searchParams } = new URL(req.url);

        const limit = 6;
        const page = searchParams.get("page") || 1;
        const skip = (page - 1) * limit;

        const services = await Service.find({ isPublish: true })
          .skip(skip)
          .limit(limit)
          .sort({
            createdAt: -1,
          });
        const total = await Service.countDocuments({ isPublish: true });

        const pages = Math.floor(total / limit) + (total % limit > 0 ? 1 : 0);

        return new Response(JSON.stringify({ services, pages, total }), {
          status: 200,
        });
      } catch (error) {
        console.log(error);
        return new Response("Failed to fetch all prompts", { status: 500 });
      }
    } else {
      return new Response(
        "Vous devez vous connecter pour effectuer cette action",
        { status: 401 }
      );
    }
  }

  async getAllCategory(req, res, next) {
    const { searchParams } = new URL(req.url);

    const limit = 8;
    const page = searchParams.get("page") || 1;
    const skip = (page - 1) * limit;

    const category = searchParams.get("category");
    const susCategory = searchParams.get("susCategory");
    const deliveryDay = searchParams.get("deliveryDay");
    const getstart = searchParams.get("getstart");

    const minPrice =
      searchParams.get("minPrice") === "undefined"
        ? 0
        : searchParams.get("minPrice");
    const maxPrice =
      searchParams.get("maxPrice") === "undefined"
        ? 2000
        : searchParams.get("maxPrice");

    const subCategories = susCategory
      ? { souscategory: { $in: susCategory } }
      : {};
    const start = getstart ? { rating: getstart } : {};

    const deliveryDays = deliveryDay
      ? { "priceDetail.title": deliveryDay }
      : {};

    const total = await Service.countDocuments({
      isPublish: true,
      isValidate: true,
      category: category,
      "priceDetail.valeur": { $gte: minPrice, $lte: maxPrice },
      ...subCategories,
      ...start,
      ...deliveryDays,
    });

    try {
      const services = await Service.find({
        isPublish: true,
        isValidate: true,
        category: category,
        "priceDetail.valeur": { $gte: minPrice, $lte: maxPrice },
        ...subCategories,
        ...start,
        ...deliveryDays,
      })
        .populate("user", "username")
        .skip(skip)
        .limit(limit);

      if (!services)
        return new Response("Aucun service trouvé", { status: 404 });

      const populatedServices = await Promise.all(
        services.map(async (service) => {
          let sellerProfile = null;
          if (service.user) {
            sellerProfile = await Profil.findOne({
              user: service.user._id,
            }).populate("user", "username");
          }
          return { ...service._doc, profil: sellerProfile };
        })
      );

      const pages = Math.floor(total / limit) + (total % limit > 0 ? 1 : 0);

      return new Response(
        JSON.stringify({ service: populatedServices, pages, total }),
        {
          status: 200,
        }
      );
    } catch (error) {
      return new Response("Internal Server Error", { status: 500 });
    }
  }

  async create(req, res, next) {
    const session = req.user;

    if (session) {
      const { title, category, souscategory, cities } = await req.json();

      try {
        const service = new Service({
          user: session.id,
          title,
          category,
          souscategory,
          cities,
        });

        await service.save();
        return new Response(JSON.stringify(service), { status: 201 });
      } catch (error) {
        return new Response("Erreur de creation de service", { status: 500 });
      }
    } else {
      return new Response(
        "Vous devez vous connecter pour effectuer cette action",
        { status: 401 }
      );
    }
  }

  async create_step2(req, res, next) {
    const session = req.user;

    if (session) {
      const { title, category, souscategory, cities } = await req.json();

      try {
        const service = new Service({
          user: session.id,
          title,
          category,
          souscategory,
          cities,
        });

        await service.save();
        return new Response(JSON.stringify(service), { status: 201 });
      } catch (error) {
        return new Response("Erreur de creation de service", { status: 500 });
      }
    } else {
      return new Response(
        "Vous devez vous connecter pour effectuer cette action",
        { status: 401 }
      );
    }
  }

  async create_step3(req, res, next) {
    const session = req.user;

    if (session) {
      const { title, valeur } = await req.json();

      try {
        const service = await Service.findByIdAndUpdate(
          req.params.id,
          {
            $set: {
              priceDetail: {
                title: title,
                valeur: valeur,
              },
            },
          },
          { new: true }
        );
        return new Response(JSON.stringify(service), { status: 201 });
      } catch (error) {
        return new Response("Erreur de creation de service", { status: 500 });
      }
    } else {
      return new Response(
        "Vous devez vous connecter pour effectuer cette action",
        { status: 401 }
      );
    }
  }

  async create_step4(req, res, next) {
    const session = req.user;

    if (session) {
      const { options } = await req.json();

      try {
        const service = await Service.findByIdAndUpdate(
          req.params.id,
          {
            $push: {
              supOption: options,
            },
          },
          { new: true }
        );
        return new Response(JSON.stringify(service), { status: 201 });
      } catch (error) {
        return new Response("Erreur de creation de service", { status: 500 });
      }
    } else {
      return new Response(
        "Vous devez vous connecter pour effectuer cette action",
        { status: 401 }
      );
    }
  }

  async create_step5(req, res, next) {
    const session = req.user;

    if (session) {
      const { serviceNote } = await req.json();

      try {
        const service = await Service.findByIdAndUpdate(
          req.params.id,
          {
            $set: {
              serviceNote: serviceNote,
            },
          },
          { new: true }
        );
        return new Response(JSON.stringify(service), { status: 201 });
      } catch (error) {
        return new Response("Erreur de creation de service", { status: 500 });
      }
    } else {
      return new Response(
        "Vous devez vous connecter pour effectuer cette action",
        { status: 401 }
      );
    }
  }

  async create_step6(req, res, next) {
    const session = req.user;

    if (session) {
      const { image } = await req.json();

      try {
        const service = await Service.findByIdAndUpdate(
          req.params.id,
          {
            $set: {
              image: image,
              isPublish: true,
            },
          },
          { new: true }
        );
        return new Response(JSON.stringify(service), { status: 201 });
      } catch (error) {
        return new Response("Erreur de creation de service", { status: 500 });
      }
    } else {
      return new Response(
        "Vous devez vous connecter pour effectuer cette action",
        { status: 401 }
      );
    }
  }

  async createFavorite(req, res, next) {
    const session = req.user;

    if (session) {
      try {
        // Vérifier si le service est déjà dans les favoris de l'utilisateur
        const { serviceId } = await req.json();
        const user = await User.findById(session.id);
        const serviceIndex = user.favoriteServices.indexOf(serviceId);

        if (serviceIndex === -1) {
          // Le service n'est pas dans les favoris, donc l'ajouter
          const userUpdated = await User.findByIdAndUpdate(session.id, {
            $addToSet: { favoriteServices: serviceId },
          });

          const service = await Service.findByIdAndUpdate(serviceId, {
            $addToSet: { favorites: session.id },
          });

          console.log(service, userUpdated);
          return new Response(JSON.stringify("Service ajouté aux favoris"), {
            status: 201,
          });
        } else {
          // Le service est déjà dans les favoris, donc le supprimer
          const removeuserF = await User.findByIdAndUpdate(session.id, {
            $pull: { favoriteServices: serviceId },
          });

          const removeService = await Service.findByIdAndUpdate(serviceId, {
            $pull: { favorites: session.id },
          });
          return new Response(JSON.stringify("Service supprimé des favoris"), {
            status: 201,
          });
        }
      } catch (error) {
        console.log(error);
        return { success: false, message: "Une erreur est survenue" };
      }
    } else {
      return new Response(
        "Vous devez vous connecter pour effectuer cette action",
        { status: 401 }
      );
    }
  }

  async getAllFavorites(req, res, next) {
    const session = req.user;

    const { searchParams } = new URL(req.url);

    const limit = 8;
    const page = searchParams.get("page") || 1;
    const skip = (page - 1) * limit;

    const id = searchParams.get("id");

    if (session) {
      try {
        const services = await Service.find({
          favorites: { $in: [id] },
        })
          .populate("user", "username")
          .skip(skip)
          .limit(limit);

        const populatedServices = await Promise.all(
          services.map(async (service) => {
            let sellerProfile = null;
            if (service.user) {
              sellerProfile = await Profil.findOne({
                user: service.user._id,
              }).populate("user", "username");
            }
            return { ...service._doc, profil: sellerProfile };
          })
        );

        const total = await Service.countDocuments({
          favorites: { $in: [id] },
        });

        const pages = Math.floor(total / limit) + (total % limit > 0 ? 1 : 0);
        return new Response(
          JSON.stringify({ service: populatedServices, total, pages }),
          {
            status: 201,
          }
        );
      } catch (error) {
        console.log(error);
        return { success: false, message: "Une erreur est survenue" };
      }
    } else {
      return new Response(
        "Vous devez vous connecter pour effectuer cette action",
        { status: 401 }
      );
    }
  }

  async getAllService(req, res, next) {
    try {
      const services = await Service.find({ isPublish: true, isValidate: true })
        .sort({ createdAt: -1 })
        .populate("user", "username");

      const populatedServices = await Promise.all(
        services.map(async (service) => {
          let sellerProfile = null;
          if (service.user) {
            sellerProfile = await Profil.findOne({
              user: service.user._id,
            }).populate("user", "username");
          }
          return { ...service._doc, profil: sellerProfile };
        })
      );
      return new Response(JSON.stringify(populatedServices), { status: 200 });
    } catch (error) {
      console.log(error);
      return new Response("Failed to fetch all prompts", { status: 500 });
    }
  }

  async getAllServiceWithUserData(req, res, next) {
    try {
      const services = await Service.find({
        isPublish: true,
        isValidate: true,
      }).sort({
        createdAt: -1,
      });

      const populatedServices = await Promise.all(
        services.map(async (service) => {
          let sellerProfile = null;
          if (service.user) {
            sellerProfile = await Profil.findOne({
              user: service.user._id,
            }).populate("user", "username");
          }
          return { ...service._doc, profil: sellerProfile };
        })
      );
      return new Response(JSON.stringify(populatedServices), { status: 200 });
      // res.status(200).json(services);
    } catch (error) {
      console.log(error);
      return new Response("Failed to fetch all prompts", { status: 500 });
    }
  }

  async getAllServiceByUser(req, res, next) {
    const session = req.user;

    if (session) {
      try {
        const services = await Service.find({
          isPublish: true,
          isValidate: true,
          user: req.params.id,
        }).populate("user");
        return new Response(JSON.stringify(services), {
          status: 200,
        });
      } catch (error) {
        return new Response("Internal Server Error", { status: 500 });
      }
    } else {
      return new Response(
        "Vous devez vous connecter pour effectuer cette action",
        { status: 401 }
      );
    }
  }

  async getAllServiceOfUser(req, res, next) {
    const session = req.user;

    const { searchParams } = new URL(req.url);

    const limit = 6;
    const page = searchParams.get("page") || 1;
    const skip = (page - 1) * limit;
    try {
      const services = await Service.find({ user: session.id })
        .skip(skip)
        .limit(limit)
        .sort({
          createdAt: -1,
        });
      const total = await Service.countDocuments({
        user: session.id,
      });

      const pages = Math.floor(total / limit) + (total % limit > 0 ? 1 : 0);

      return new Response(JSON.stringify({ services, pages, total }), {
        status: 200,
      });
    } catch (error) {
      return new Response("Failed to fetch all prompts", { status: 500 });
    }
  }

  async searchService(req, res, next) {
    const { searchParams } = new URL(req.url);

    const limit = 8;
    const page = searchParams.get("page") || 1;
    const skip = (page - 1) * limit;

    const keywords = searchParams.get("keywords");

    const search = keywords
      ? {
          title: {
            $regex: keywords,
            $options: "i",
          },
        }
      : {};

    const total = await Service.countDocuments({
      isPublish: true,
      isValidate: true,
      ...search,
      isPublish: true,
      // isValidate: true,
    });

    try {
      const services = await Service.find({
        isPublish: true,
        isValidate: true,
        ...search,
        isPublish: true,
        //   isValidate: true,
      })
        .populate("user", "username")
        .skip(skip)
        .limit(limit);

      const populatedServices = await Promise.all(
        services.map(async (service) => {
          let sellerProfile = null;
          if (service.user) {
            sellerProfile = await Profil.findOne({
              user: service.user._id,
            }).populate("user", "username");
          }
          return { ...service._doc, profil: sellerProfile };
        })
      );

      const pages = Math.floor(total / limit) + (total % limit > 0 ? 1 : 0);

      return new Response(
        JSON.stringify({ service: populatedServices, pages, total }),
        {
          status: 200,
        }
      );
    } catch (error) {
      return new Response("Internal Server Error", { status: 500 });
    }
  }

  async getSellerServices(req, res, next) {
    try {
      const services = await Service.find({
        user: req.params.id,
      }).populate("user", "username createdAt");
      const user = await User.findById(req.params.id);
      const populatedServices = await Promise.all(
        services.map(async (service) => {
          let sellerProfile = null;
          if (service.user) {
            sellerProfile = await Profil.findOne({
              user: service.user._id,
            }).populate("user", "username createdAt");
          }
          return { ...service._doc, profil: sellerProfile };
        })
      );

      const profileSeller = await Profil.findOne({
        user: req.params.id,
      }).populate("user", "username createdAt");

      const responseData = {
        populatedServices,
        profileseller: profileSeller,
        user,
      };
      return new Response(JSON.stringify(responseData), {
        status: 200,
      });
    } catch (error) {
      console.error(error);
      return new Response("Erreur de serveur", { status: 500 });
    }
  }

  async updateAdminValidate(req, res, next) {
    const session = req.user;

    try {
      if (session && session && !session.isAdmin) {
        throw new Error(ERROR_MESSAGES.NOT_LOGGED_IN);
      }

      const existingService = await Service.findById(req.params.id);

      if (!existingService) {
        throw new Error(ERROR_MESSAGES.SERVICE_NOT_FOUND, { status: 404 });
      }

      const isValidate = !existingService.isValidate;

      const service = await Service.findByIdAndUpdate(req.params.id, {
        $set: { isValidate },
      });

      return new Response(JSON.stringify(service), {
        status: 200,
      });
    } catch (error) {
      console.log(error);
      return new Response(error, { status: 500 });
    }
  }

  async deleteAdminValidate(req, res, next) {
    const session = req.user;

    try {
      // Vérifier si l'utilisateur est connecté
      if (session && session && !session.isAdmin) {
        throw new Error(ERROR_MESSAGES.NOT_LOGGED_IN);
      }

      const existingService = await Service.findById(req.params.id);
      // Vérifier si le service existe
      if (!existingService) {
        throw new Error(ERROR_MESSAGES.SERVICE_NOT_FOUND, { status: 404 });
      }

      await Service.findByIdAndDelete(req.params.id);

      return new Response(
        JSON.stringify({ message: "Service supprimé avec succès" }),
        {
          status: 200,
        }
      );
    } catch (error) {
      console.log(error);
      return new Response(error, { status: 500 });
    }
  }
}

module.exports = ServiceService;
