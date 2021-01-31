import mongoose from "mongoose";

export default mongoose.model("Directory", new mongoose.Schema({
  dirName: String,
  guildID: Date,
  authorID: String
}));
