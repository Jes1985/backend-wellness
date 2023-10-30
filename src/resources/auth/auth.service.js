const { dbConnect } = require("../../config/dbConnect");
const User = require("../user/user.model");
const { verifyPassword } = require("../../utils/auth.util");
const jwt = require("jsonwebtoken");
const { jsonResponse } = require("../../utils/jsonResponse.util");
require("dotenv").config();

class AuthService {
  async oAuthLogin(req, res, next) {
    try {
      const { email, password } = req.body;

      const userLogin = await User.findOne({ email }).select("+isAdmin");

      if (!userLogin) {
        throw new Error("Erreur: utilisateur introuvable");
      }

      const isValid = await verifyPassword(password, userLogin.password);

      if (!isValid) {
        throw new Error("Erreur: Mot de passe incorrect");
      }

      const user = {
        id: userLogin._id,
        username: userLogin.username,
        email: userLogin.email,
        isAdmin: userLogin.isAdmin,
      };
      const token = jwt.sign(user, process.env.JWT_ACCESS_KEY, {
        expiresIn: "3d",
      });

      return res.json(
        jsonResponse(
          JSON.stringify({ ...user, token }),
          200,
          "User logged successfully"
        )
      );
    } catch (err) {
      return res.json(
        jsonResponse(JSON.stringify(undefined), 400, err.message)
      );
    }
  }
}

module.exports = AuthService;
