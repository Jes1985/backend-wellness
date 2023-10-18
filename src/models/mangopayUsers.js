import mongoose from 'mongoose';

const MangouserSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    ClienId: {
      type: String,
      required: true,
    },
    walletId: {
      type: String,
    },
    isWallet: {
      type: Boolean,
      default: false,
    },
    isBan: {
      type: Boolean,
      default: false,
    },
    isKyc: {
      type: Boolean,
      default: false,
    },
    kycId: {
      type: String,
    },
    isKycpage: {
      type: Boolean,
      default: false,
    },

    cardUrl: {
      type: String,
    },
    accessKeys: {
      type: String,
    },

    dataRegistration: {
      type: String,
    },
    cardId: {
      type: String,
    },

    isCarurl: {
      type: Boolean,
      default: false,
    },
    isCard: {
      type: Boolean,
      default: false,
    },
    FirstName: {
      type: String,
      required: true,
    },
    LastName: {
      type: String,
      required: true,
    },
    UserCategory: {
      type: String,
      required: true,
    },
    Address: {
      AddressLine1: {
        type: String,
      },
      AddressLine2: {
        type: String,
      },
      City: {
        type: String,
      },
      Region: {
        type: String,
      },
      PostalCode: {
        type: String,
      },
      Country: {
        type: String,
      },
    },
    Birthday: {
      type: String,
      required: true,
    },
    Nationality: {
      type: String,
      required: true,
    },
    CountryOfResidence: {
      type: String,
      required: true,
    },
    Email: {
      type: String,
      required: true,
    },
    Capacity: {
      type: String,
      required: true,
    },
    Tag: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Mangouser ||
  mongoose.model('Mangouser', MangouserSchema);
