import mongoose from "mongoose";

export interface IconGroupDocument extends mongoose.Document {
  name: string;
  guildID: string;
  authorID: string;
}

export default mongoose.model("IconGroup", new mongoose.Schema({
  name: { type: String, required: true },
  guildID: { type: String, required: true },
  authorID: { type: String, required: true }
}, {
  id: true
}));
