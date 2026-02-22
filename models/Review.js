import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema({
  contractId: { type: mongoose.Schema.Types.ObjectId, ref: "Contract", required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  reviewerId: { type: String, required: true },
  revieweeId: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, required: true },
  type: { type: String, enum: ["client_to_developer", "developer_to_client"], required: true },
}, { timestamps: true });

export default mongoose.models.Review || mongoose.model("Review", ReviewSchema);
