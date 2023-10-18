const Blog = require("./blog.model");
const HttpException = require("../../utils/exceptions/http.exception");
const { dbConnect } = require("../../config/dbConnect");

dbConnect();

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
}

module.exports = BlogService;
