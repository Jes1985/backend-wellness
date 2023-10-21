const mongoose = require("mongoose");
const FavoriteSchema = new mongoose.Schema(
  {
    service: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Service",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Favorite || mongoose.model("Favorite", FavoriteSchema);
