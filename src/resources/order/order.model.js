const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Service",
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    price: {
      type: Number,
      required: true,
    },
    commandeType: {
      type: String,
    },
    isCostum: {
      type: Boolean,
    },
    costumservice: [
      {
        name: {
          type: String,
        },
        title: { type: String },
        value: {
          type: Number,
        },
      },
    ],

    fees: {
      type: String,
    },
    status: {
      type: String,
      default: "En attente",
    },
    ispaid: {
      type: Boolean,
      default: false,
    },
    delai: {
      type: String,
    },
    clientName: {
      type: String,
    },
    clientFirstName: {
      type: String,
    },
    clientAddresse: {
      type: String,
    },
    clientEmail: {
      type: String,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    payementId: {
      type: String,
    },

    optionpement: {
      id: { type: String },
      amount: { type: Number },
      ispaid: {
        type: Boolean,
        default: false,
      },
    },
  },

  { timestamps: true }
);

module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);
