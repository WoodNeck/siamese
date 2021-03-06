import User from "./User";

interface IconGroup {
  id: string;
  name: string;
  guildID: string;
  authorID: string;
  iconCount: number;
  createdTimestamp: number;
  author?: User;
}

export default IconGroup;
