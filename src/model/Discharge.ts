import mongoose from "mongoose";

export interface DischargeDocument extends mongoose.Document {
  guildID: string;
  userName: string;
  joinDate: string;
  force: string;
}

export default mongoose.model<DischargeDocument>("Discharge", new mongoose.Schema({
  guildID: { type: String, required: true },
  userName: { type: String, required: true },
  joinDate: { type: String, required: true, index: false },
  force: { type: String, required: true, index: false }
}, {
  id: false
}));
