import Guild from "./Guild";

interface User {
  id: string;
  username: string;
  tag: string;
  avatarURL: string;
  guilds: Array<Omit<Guild, "hasSiamese" | "hasPermission" | "isAdmin">>;
}

export default User;
