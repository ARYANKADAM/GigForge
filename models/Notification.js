import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  message: { type: String, required: true },
  type: { type: String, enum: ["bid", "bid_accepted", "message", "payment", "review"], default: "bid" },
  isRead: { type: Boolean, default: false },
  link: { type: String },
}, { timestamps: true });

export default mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);