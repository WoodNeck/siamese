interface User {
  id: string;
  avatar: string;
  avatarURL: string;
  bot: boolean;
  createdTimeStamp: number;
  defaultAvatarURL: string;
  discriminator: string;
  displayAvatarURL: string;
  flags: number;
  tag: string;
  username: string;
}

export default User;
