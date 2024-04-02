/* eslint-disable @typescript-eslint/naming-convention */
import mongoose from "mongoose";

export interface MessageLogDocument extends mongoose.Document {
  channelID: string;
  messageID: string;
}

export default mongoose.model<MessageLogDocument>("MessageLog", new mongoose.Schema({
  channelID: { type: String, required: true },
  messageID: { type: String, required: true, unique: true }
}, {
  id: false
}));
