export const COOLDOWN = {
  PER_GUILD: (seconds: number) => ({
    time: seconds,
    key: "guild"
  }),
  PER_CHANNEL: (seconds: number) => ({
    time: seconds,
    key: "channel"
  }),
  PER_USER: (seconds: number) => ({
    time: seconds,
    key: "author"
  })
};

export const ACTIVITY = {
  PLAYING: "PLAYING",
  STREAMING: "STREAMING",
  LISTENING: "LISTENING",
  WATCHING: "WATCHING"
};
