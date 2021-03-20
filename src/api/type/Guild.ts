interface Guild {
  id: string;
  name: string;
  iconURL: string | null;
  hasSiamese: boolean;
  hasPermission: boolean;
  isAdmin: boolean;
}

export default Guild;
