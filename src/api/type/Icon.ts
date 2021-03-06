import User from "./User";

interface Icon {
  id: string;
  name: string;
  url: string;
  guildID: string;
  authorID: string;
  groupID: string;
  createdTimestamp: number;
  author?: User;
}

export default Icon;
