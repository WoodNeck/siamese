/* eslint-disable @typescript-eslint/naming-convention */
import mongoose from "mongoose";

export interface GuildConfigDocument extends mongoose.Document {
  guildID: string;
  iconManageRoleID?: string;
}

export default mongoose.model<GuildConfigDocument>("GuildConfig", new mongoose.Schema({
  guildID: { type: String, required: true, unique: true },
  iconManageRoleID: { type: String  }
}, {
  id: false
}));
