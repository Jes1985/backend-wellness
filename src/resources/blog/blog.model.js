const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    titre: {
      type: String,
      required: true,
    },
    time: {
      type: String,
    },
    image: {
      type: String,
    },
    description: {
      type: String,
    },

    category: {
      type: String,
    },

    comment: [{ type: String }],
    usersRate: [{ type: String }],
    rating: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Blog || mongoose.model("Blog", blogSchema);
