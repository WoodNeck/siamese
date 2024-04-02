/* eslint-disable @typescript-eslint/naming-convention */
import mongoose from "mongoose";

export interface GuildConfigDocument extends mongoose.Document {
  guildID: string;
  voiceAutoOut: boolean;
  activeRoles: string[];
  iconManageRoleID?: string;
}

const GuildConfigModel = mongoose.model<GuildConfigDocument>("GuildConfig", new mongoose.Schema({
  guildID: { type: String, required: true, unique: true },
  voiceAutoOut: { type: Boolean, default: true },
  activeRoles: { type: [String], default: [] },
  iconManageRoleID: { type: String }
}, {
  id: false
}));

export default GuildConfigModel;
