export const ENTRIES_ENDPOINT = "http://guide.ff14.co.kr/lodestone/search";
export const ITEM_ENDPOINT = (subURL: string) => `http://guide.ff14.co.kr${subURL}`;
export const ITEM_COLOR: Record<string, `#${string}`> = {
  "col2": "#61b400",
  "col3": "#1a66ff",
  "col4": "#910fff",
  "col7": "#ff3dad",
  "col8": "#959595"
};
