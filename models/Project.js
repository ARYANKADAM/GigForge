import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  budget: { type: Number, required: true },
  deadline: { type: Date },
  skills: [{ type: String }],
  clientId: { type: String, required: true },
  clientName: { type: String },
  status: { type: String, enum: ["open", "in_progress", "completed", "cancelled", "disputed"], default: "open" },
  selectedBidId: { type: mongoose.Schema.Types.ObjectId, ref: "Bid" },
  selectedDeveloperId: { type: String },
  attachments: [{ type: String }],
  bidsCount: { type: Number, default: 0 },
  isModerated: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.Project || mongoose.model("Project", ProjectSchema);
