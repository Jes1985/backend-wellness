const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Entrez votre nom svp!"],
    },
    email: {
      type: String,
      required: [true, "Entrez votre email svp!"],
    },
    password: {
      type: String,
      required: [true, "Entrez votre mot de passe svp!"],
    },
    image: {
      type: String,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    plan: {
      type: String,
    },
    stripe_account_id: String,
    stripe_seller: {},
    stripeSession: {},
    stripe_cumtomer_id: String,
    subscription: [],

    favoriteServices: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

// module.exports =
mongoose.models.User || mongoose.model("User", UserSchema);

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
