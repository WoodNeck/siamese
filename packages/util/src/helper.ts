// syntatic sugar
export const range = (count: number) => Array.from(Array(count).keys());
export const isBetween = (val: number, min: number, max: number) => val >= min && val <= max;
export const groupBy = <T>(arr: T[], count: number) => {
  return new Array(Math.ceil(arr.length / count)).fill(0).map((_, idx) => {
    return arr.slice(idx * count, idx * count + count);
  });
};
export const waitFor = async (time: number) => {
  return new Promise<void>(resolve => {
    setTimeout(resolve, time);
  });
};
export const toValidURL = (url: string) => {
  if (url.startsWith("//")) return `https:${url}`;
  else if (url.startsWith("/")) return "";
  return url.startsWith("http:") || url.startsWith("https:")
    ? url
    : "";
};
