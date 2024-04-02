import GuildConfigModel, { type GuildConfigDocument } from "../model/GuildConfig";

class GuildConfig {
  public static async create(options: Partial<GuildConfigDocument>) {
    return await GuildConfigModel.create(options);
  }

  public static async findByGuildID(guildID: string) {
    return await GuildConfigModel.findOne({ guildID }).lean();
  }

  public static async getActiveRoles(guildID: string): Promise<string[]> {
    const document = await GuildConfig.findByGuildID(guildID);
    if (!document) return [];

    return document.activeRoles;
  }

  public static async update(guildID: string, options: Partial<GuildConfigDocument>): Promise<void> {
    await GuildConfigModel.updateOne({ guildID }, options);
    return;
  }
}

export default GuildConfig;
