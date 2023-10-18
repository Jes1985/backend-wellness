const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    userAgent: {
      type: String,
      required: true,
    },
    ip: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    device: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Visitor ||
  mongoose.model('Visitor', visitorSchema);
