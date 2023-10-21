const mongoose = require("mongoose");
const SubscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    packname: {
      type: String,
      required: true,
    },
    packprice: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Subscription ||
  mongoose.model("Subscription", SubscriptionSchema);
