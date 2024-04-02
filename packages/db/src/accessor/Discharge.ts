import DischargeModel from "../model/Discharge";

class Discharge {
  public static async add(name: string, guildID: string, joinDate: string, force: string) {
    return await DischargeModel.create({
      guildID,
      userName: name,
      joinDate,
      force
    });
  }

  public static async find(name: string, guildID: string) {
    return await DischargeModel.findOne({
      guildID,
      userName: name
    }).lean();
  }

  public static async findAll(guildID: string) {
    return await DischargeModel.find({
      guildID
    }).lean();
  }

  public static async remove(name: string, guildID: string) {
    return await DischargeModel.deleteOne({
      guildID,
      userName: name
    });
  }
}

export default Discharge;
