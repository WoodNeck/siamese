import mongoose from "mongoose";

export interface IconDocument extends mongoose.Document {
  name: string;
  url: string;
  guildID: string;
  authorID: string;
  groupID: string;
}

export default mongoose.model<IconDocument>("Icon", new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  guildID: { type: String, required: true },
  authorID: { type: String, required: true },
  groupID: { type: String, required: true }
}, {
  id: false
}));
