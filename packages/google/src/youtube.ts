import { Innertube, YTNodes } from "youtubei.js";

const youtube = await Innertube.create({
  lang: "ko",
  location: "KR",
  retrieve_player: false,
  device_category: "desktop"
});

const searchVideos = async (searchText: string) => {
  const { results } = await youtube.search(searchText, {
    type: "video"
  });

  return (results ?? [])
    .filter(video => video.type === "Video")
    .map(video => {
      return video.as(YTNodes.Video);
    });
};

export {
  searchVideos
};
