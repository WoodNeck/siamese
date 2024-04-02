import * as fs from "fs";

import axios from "axios";
import { load } from "cheerio";

import { FAKE_HEADER, IMAGE_BLACKLIST, IMAGE_SEARCH_PARAMS, IMAGE_SEARCH_URL } from "./const";

const REGEX = /\["(\bhttps?:\/\/[^"]+)",(?:\d+),(?:\d+)\],null/g;

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

const parseImages = (body: string): string[] => {
  const $ = load(body);
  const scripts = $("script");

  fs.writeFileSync("./index.html", body);

  const validScript = scripts.toArray().find(script => {
    return $(script).text().trimStart().startsWith("(function(){google.kEXPI");
  });
  const matched = $(validScript).text().matchAll(REGEX);

  return Array.from(matched).map(url => url[1]);
};

const searchImages = async (searchText: string, nsfw: boolean) => {
  const res = await axios.get(IMAGE_SEARCH_URL, {
    params: IMAGE_SEARCH_PARAMS(searchText, !nsfw),
    headers: FAKE_HEADER
  });

  const images = parseImages(res.data);

  return images.filter(filterImage);
};

export {
  searchImages
};
