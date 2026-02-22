import mongoose from "mongoose";

const BidSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  developerId: { type: String, required: true },
  developerName: { type: String },
  developerImage: { type: String },
  amount: { type: Number, required: true },
  deliveryDays: { type: Number, required: true },
  proposal: { type: String, required: true },
  status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
}, { timestamps: true });

export default mongoose.models.Bid || mongoose.model("Bid", BidSchema);
