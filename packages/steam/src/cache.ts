import NodeCache from "node-cache";

// 1시간 캐시
const userCache = new NodeCache({
  stdTTL: 60 * 60,
  useClones: false
});

const topGamesCache = new NodeCache({
  stdTTL: 60 * 60,
  useClones: false
});

export {
  userCache,
  topGamesCache
};
