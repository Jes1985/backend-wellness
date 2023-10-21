const Blog = require("./blog.model");
const HttpException = require("../../utils/exceptions/http.exception");
const { dbConnect } = require("../../config/dbConnect");

dbConnect();

const ERROR_MESSAGES = {
  CREATION_ERROR: 'Erreur de donnée',
};

class BlogService {
  Blog = Blog;

  async create(req, res, next) {
    const session = "any";

    if (session) {
      const { titre, time, image, description, category } = req.body;
      try {
        const blog = new Blog({
          user: req.user.id,
          titre,
          time,
          image,
          description,
          category,
        });

        await blog.save();
        return new Response(JSON.stringify(blog), { status: 201 });
      } catch (error) {
        console.log(error);
        return new Response("Erreur de creation de service", { status: 500 });
      }
    } else {
      return new Response(
        "Vous devez vous connecter pour effectuer cette action",
        { status: 401 }
      );
    }
  }
  async getById(req, res, next) {
    try {
      const blog = await Blog.findById(req.params.id).populate(
        "user",
        "username"
      );

      if (!blog) return new Response("Aucun service trouvé", { status: 404 });

      return new Response(JSON.stringify(blog), {
        status: 200,
      });
    } catch (error) {
      return new Response("Internal Server Error", { status: 500 });
    }
  }

  async getAll(req, res, next) {
    try {
      const blog = await Blog.find({});
      return new Response(JSON.stringify(blog), {
        status: 201,
      });
    } catch (error) {
      console.log(error);
      return new Response("Erreur de creation de service", { status: 500 });
    }
  }

  async deleteById(req, res, next) {
    const session = "user";

    /**
     * TODO: Add auth to check connected user before use this route
     */
    try {
      if (!session) {
        throw new Error(
          "Vous devez vous connecter pour effectuer cette operation"
        );
      }
      const blog = await Blog.findByIdAndDelete(req.params.id);
      return new Response("Blog supprimer avec success", {
        status: 200,
      });
    } catch (error) {
      return new Response("Internal Server Error", { status: 500 });
    }
  }

  async updateById(req, res, next) {
    const session = "user";

    if (session) {
      const { titre, time, image, description, category } = req.body;
      try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
          throw new Error("Aucun article de blog trouvé");
        }
        blog.titre = titre;
        blog.time = time;
        blog.image = image;
        blog.description = description;
        blog.category = category;

        await blog.save();
        return new Response(JSON.stringify(blog), { status: 201 });
      } catch (error) {
        console.log(error);
        return new Response("Erreur de creation de service", { status: 500 });
      }
    } else {
      return new Response(
        "Vous devez vous connecter pour effectuer cette action",
        { status: 401 }
      );
    }
  }

  async getBlogCategory(req, res, next) {
    const { searchParams } = new URL(req.url);
    const limit = 4;
    const pagem = parseInt(searchParams.get('pagem')) || 1;
    const pagen = parseInt(searchParams.get('pagen')) || 1;
    const pagei = parseInt(searchParams.get('pagei')) || 1;

    const skipm = (pagem - 1) * limit;
    const skipn = (pagen - 1) * limit;
    const skipi = (pagei - 1) * limit;
    try {
      const countPromises = [
        Blog.countDocuments({ category: 'Mieux connaitre la plateforme' }),
        Blog.countDocuments({ category: 'Nos Nouvelles parutions' }),
        Blog.countDocuments({ category: "S'informer et se former" }),
      ];

      const [Mieuxtotal, nosNouvellesTotal, informerTotal] = await Promise.all(
        countPromises
      );

      const getPageCount = (total) =>
        Math.floor(total / limit) + (total % limit > 0 ? 1 : 0);

      const pagesMieux = getPageCount(Mieuxtotal);
      const pagesnosNouvelles = getPageCount(nosNouvellesTotal);
      const pagesinformer = getPageCount(informerTotal);

      const getBlogs = async (category, skip) =>
        Blog.find({ category }).skip(skip).limit(limit).sort({ createdAt: -1 });

      const [mieuxConnaitre, nosNouvelles, informer] = await Promise.all([
        getBlogs('Mieux connaitre la plateforme', skipm),
        getBlogs('Nos Nouvelles parutions', skipn),
        getBlogs("S'informer et se former", skipi),
      ]);

      const responseData = {
        mieuxConnaitre,
        nosNouvelles,
        informer,
        pagesMieux,
        pagesnosNouvelles,
        pagesinformer,
      };

      return new Response(JSON.stringify(responseData), {
        status: 201,
      });
    } catch (error) {
      console.log(error);
      return new Response(ERROR_MESSAGES.CREATION_ERROR, { status: 500 });
    }
  }

  async getAdminList(req, res, next) {
    try {
      const { searchParams } = new URL(req.url);
      const limit = 6;
      const page = searchParams.get('page') || 1;
      const skip = (page - 1) * limit;

      const total = await Blog.countDocuments({});

      const pages = Math.floor(total / limit) + (total % limit > 0 ? 1 : 0);
      const blog = await Blog.find({})
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      return new Response(JSON.stringify({ blog, pages, total }), {
        status: 201,
      });
    } catch (error) {
      console.log(error);
      return new Response('Erreur de creation de service', { status: 500 });
    }
  }

  async getByCategory(req, res, next) {
    try {
      const { searchParams } = new URL(req.url);
      const limit = 4;
      const pagem = parseInt(searchParams.get('pagem')) || 1;
      const pagen = parseInt(searchParams.get('pagen')) || 1;
      const pagei = parseInt(searchParams.get('pagei')) || 1;

      const skipm = (pagem - 1) * limit;
      const skipn = (pagen - 1) * limit;
      const skipi = (pagei - 1) * limit;

      const countPromises = [
        Blog.countDocuments({ category: 'Mieux connaitre la plateforme' }),
        Blog.countDocuments({ category: 'Nos Nouvelles parutions' }),
        Blog.countDocuments({ category: "S'informer et se former" }),
      ];

      const [Mieuxtotal, nosNouvellesTotal, informerTotal] = await Promise.all(
        countPromises
      );

      const getPageCount = (total) =>
        Math.floor(total / limit) + (total % limit > 0 ? 1 : 0);

      const pagesMieux = getPageCount(Mieuxtotal);
      const pagesnosNouvelles = getPageCount(nosNouvellesTotal);
      const pagesinformer = getPageCount(informerTotal);

      const getBlogs = async (category, skip) =>
        Blog.find({ category }).skip(skip).limit(limit).sort({ createdAt: -1 });

      const [mieuxConnaitre, nosNouvelles, informer] = await Promise.all([
        getBlogs('Mieux connaitre la plateforme', skipm),
        getBlogs('Nos Nouvelles parutions', skipn),
        getBlogs("S'informer et se former", skipi),
      ]);

      const responseData = {
        mieuxConnaitre,
        nosNouvelles,
        informer,
        pagesMieux,
        pagesnosNouvelles,
        pagesinformer,
      };

      return new Response(JSON.stringify(responseData), {
        status: 201,
      });
    } catch (error) {
      console.log(error);
      return new Response(ERROR_MESSAGES.CREATION_ERROR, { status: 500 });
    }
  }

  async getBlogListAdmin(req, res, next) {

    const { searchParams } = new URL(req.url);
    const limit = 6;
    const page = searchParams.get('page') || 1;
    const skip = (page - 1) * limit;
    try {
      const total = await Blog.countDocuments({});

      const pages = Math.floor(total / limit) + (total % limit > 0 ? 1 : 0);
      const blog = await Blog.find({})
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      return new Response(JSON.stringify({ blog, pages, total }), {
        status: 201,
      });
    } catch (error) {
      console.log(error);
      return new Response('Erreur de creation de service', { status: 500 });
    }
  }


}


module.exports = BlogService;
