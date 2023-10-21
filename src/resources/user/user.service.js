const User = require("./user.model");
const Profil = require("../../models/profile");
const HttpException = require("../../utils/exceptions/http.exception");
const { dbConnect } = require("../../config/dbConnect");
const { hashPassword } = require("../../utils/auth.util");
const jwt = require("jsonwebtoken");
const { jsonResponse } = require("../../utils/jsonResponse.util");

const ERROR_MESSAGES = {
  CREATION_ERROR: "Erreur de donnée",
};

class UserService {
  User = User;
  Profil = Profil;

  async create(req, res, next) {
    const session = req.user;

    if (session) {
      const { profil, bio, banner } = await req.body;
      try {
        const profile = new Profil({
          user: session.id,
          profil,
          bio,
          banner,
        });

        await profile.save();
        return res.json(jsonResponse(JSON.stringify(profile), { status: 201 }));
      } catch (error) {
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

  async getAll(req, res, next) {
    const session = req.user;

    if (!session) {
      return NextResponse.json({
        message: "Vous devez vous connecter pour effectuer cette action",
      });
    }

    try {
      const profil = await Profil.findOne({ user: session.id });
      return res.json(jsonResponse(JSON.stringify(profil), { status: 200 }));
    } catch (error) {
      console.log(error);
      return res.json(jsonResponse("Erreur de profil", { status: 500 }));
    }
  }

  async updateById(req, res, next) {
    const session = req.user;

    if (!session) {
      return NextResponse.json({
        message: "Vous devez vous connecter pour effectuer cette action",
      });
    }
    const { profil, bio, banner } = await req.body;
    try {
      const profile = await Profil.findOneAndUpdate({
        user: session.id,
        $set: {
          profil: profil,
          bio: bio,
          banner: banner,
        },

        new: true,
      });
      return res.json(jsonResponse(JSON.stringify(profile), { status: 200 }));
    } catch (error) {
      console.log(error);
      return res.json(jsonResponse("Erreur de profil", { status: 500 }));
    }
  }

  async updatePassword(req, res, next) {
    try {
      const { reset_code, password } = await req.body;
      const user = await User.findOne({ reset_code: reset_code });

      if (!user) {
        throw new Error("Code invalide");
      }

      if (password) {
        const passhash = await hashPassword(password);
        user.password = passhash;
        user.reset_code = "";
      }

      const saveUser = await user.save();
      return res.json(
        jsonResponse(JSON.stringify(saveUser), {
          status: 200,
        })
      );
    } catch (error) {
      console.log(error);
      return res.json(
        jsonResponse(error.message, {
          status: 500,
        })
      );
    }
  }

  async signUp(req, res, next) {
    const { username, email, password } = await req.body;

    try {
      console.log("start request");
      const userExist = await User.findOne({ email });

      if (userExist) {
        console.log(jsonResponse("Erreur de serveur", { status: 500 }));
        return res.json(
          jsonResponse(
            JSON.stringify(undefined),
            { status: 400 },
            "user already exist"
          )
        );
      }

      const passhash = await hashPassword(password);
      const user = new User({
        username,
        email,
        password: passhash,
        // stripe_account_id: customer.id,
      });

      const saveUser = await user.save();
      console.log(passhash, saveUser);
      return res.json(jsonResponse(JSON.stringify(saveUser), { status: 201 }));
    } catch (error) {
      console.log(error);
      return res.json(jsonResponse("Erreur de serveur", { status: 500 }));
    }
  }

  async getAllSignUp(req, res, next) {
    const session = req.user;
    try {
      const user = await User.findById(session.id);
      console.log(user);
      return res.json(
        jsonResponse(JSON.stringify(user), {
          status: 200,
        })
      );
    } catch (error) {
      console.log(error);
      return res.json(jsonResponse("Erreur de serveur", { status: 500 }));
    }
  }
}

module.exports = UserService;
