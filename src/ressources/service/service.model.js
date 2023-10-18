import mongoose from 'mongoose';

const ServiceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },

    title: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    cities: [
      {
        type: String,
      },
    ],

    souscategory: [
      {
        type: String,
      },
    ],

    description: {
      type: String,
    },
    priceDetail: {
      title: {
        type: String,
      },
      valeur: {
        type: Number,
      },
    },

    supOption: [
      {
        name: {
          type: String,
        },

        title: {
          type: String,
          required: true,
        },
        value: {
          type: Number,
          required: true,
        },
      },
    ],

    serviceNote: {
      type: String,
    },

    image: [{ type: String }],
    rating: {
      type: Number,
      default: 0,
    },
    numberOfRating: {
      type: Number,
      default: 0,
    },

    comment: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'User',
        },
        name: {
          type: String,
          required: true,
        },
        text: {
          type: String,
          requiered: [true, 'Saisissez votre commentaire svp!'],
        },
        star: {
          type: Number,
        },
      },
    ],
    isPublish: {
      type: Boolean,
      default: false,
    },

    isValidate: {
      type: Boolean,
      default: false,
    },

    isReview: {
      type: Boolean,
      default: false,
    },

    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    reset_code: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Service ||
  mongoose.model('Service', ServiceSchema);
