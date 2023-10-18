import mongoose from 'mongoose';

const profilSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    profil: {
      type: String,
    },
    banner: {
      type: String,
    },
    bio: {
      type: String,
    },
    plan: {
      type: String,
      required: true,
      default: 'none',
    },
  },
  { timestamps: true }
);

export default mongoose.models.Profil || mongoose.model('Profil', profilSchema);
