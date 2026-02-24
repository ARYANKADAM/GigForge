import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  message: { type: String, required: true },
  type: { type: String, enum: ["bid", "bid_accepted", "message", "payment", "review", "timeline"], default: "bid" },
  isRead: { type: Boolean, default: false },
  link: { type: String },
}, { timestamps: true });

// drop stale model definition so enum updates take effect during hot reloads
if (mongoose.models.Notification) {
  delete mongoose.models.Notification;
}

export default mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);