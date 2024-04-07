import { TTSConfigModel } from "../model/TTSConfig";

class TTSConfig {
  public static async findOrCreate(userID: string) {
    const config = await TTSConfigModel.findOne({ userID }).lean();

    if (config) {
      return config;
    } else {
      return await TTSConfigModel.create({ userID });
    }
  }

  public static async changeSpeaker(userID: string, newSpeaker: string) {
    await TTSConfigModel.findOneAndUpdate({
      userID
    }, {
      speaker: newSpeaker
    });
  }

  public static async updateValue(userID: string, field: string, newValue: number) {
    return await TTSConfigModel.findOneAndUpdate({
      userID
    }, {
      [field]: newValue
    }, {
      new: true
    }).lean();
  }
}

export default TTSConfig;
