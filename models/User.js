import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: { type: String },
  imageUrl: { type: String },
  role: { type: String, enum: ["client", "developer", "admin"], required: true },
  bio: { type: String, default: "" },
  skills: [{ type: String }],
  hourlyRate: { type: Number },
  portfolio: { type: String },
  location: { type: String, default: "" },
  totalEarned: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  isBanned: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);
