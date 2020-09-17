import Discord from "discord.js";
import Category from "./Category";

interface Command {
  name: string;
  description: string;
  usage: string;
  hidden: boolean;
  devOnly: boolean;
  permissions: { flag: Discord.PermissionString, message: string }[];
  execute: () => void;
  category: Category;
  beforeRegister: () => boolean;
}

export default Command;
