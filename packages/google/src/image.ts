import gis from "async-g-i-s";

import { IMAGE_BLACKLIST, IMAGE_SEARCH_PARAMS } from "./const";

// eslint-disable-next-line no-control-regex
const containsNonLatinCodepoints = /[^\u0000-\u00ff]/;
const filterImage = (url: string) => {
  const inBlacklist = IMAGE_BLACKLIST.some(regex => {
    return regex.test(url);
  });

  if (inBlacklist) return false;

  try {
    const decoded = decodeURIComponent(url);
    return !containsNonLatinCodepoints.test(decoded);
  } catch (err) {
    return false;
  }
};

const searchImages = async (searchText: string, nsfw: boolean) => {
  const images = await gis(searchText, {
    query: IMAGE_SEARCH_PARAMS(!nsfw),
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
  });

  return images
    .map(img => img.url)
    .filter(filterImage);
};

export {
  searchImages
};
