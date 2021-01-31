import mongoose from "mongoose";

export default mongoose.model("Icon", new mongoose.Schema({
  name: String,
  url: String,
  guildID: Date,
  authorID: String,
  dirID: String
}, {
  id: false
}));
