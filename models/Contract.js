import mongoose from "mongoose";

const MilestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ["pending", "submitted", "approved", "paid"], default: "pending" },
  dueDate: { type: Date },
});

// timeline entries allow tracking progress or notes for the contract
const TimelineEntrySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date, default: Date.now },
  createdBy: { type: String, required: true }, // clerkId of user who added
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
});

const ContractSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  bidId: { type: mongoose.Schema.Types.ObjectId, ref: "Bid", required: true },
  clientId: { type: String, required: true },
  developerId: { type: String, required: true },
  agreedAmount: { type: Number, required: true },
  deliveryDays: { type: Number, required: true },
  status: { type: String, enum: ["active", "completed", "cancelled", "disputed"], default: "active" },
  escrowStatus: { type: String, enum: ["pending", "funded", "released", "refunded"], default: "pending" },
  stripePaymentIntentId: { type: String },
  milestones: [MilestoneSchema],
  timeline: [TimelineEntrySchema],
  roomId: { type: String }, // chat room
  completedAt: { type: Date },
}, { timestamps: true });

export default mongoose.models.Contract || mongoose.model("Contract", ContractSchema);
