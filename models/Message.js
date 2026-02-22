import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  roomId: { type: String, required: true, index: true },
  senderId: { type: String, required: true },
  senderClerkId: { type: String },
  receiverId: { type: String },
  senderName: { type: String },
  senderImage: { type: String },
  content: { type: String, required: true },
  type: { type: String, enum: ["text", "file", "system"], default: "text" },
  fileUrl: { type: String },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.Message || mongoose.model("Message", MessageSchema);
