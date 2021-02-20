// Dedent from string, useful for multiline string template
export const dedent = (callSite: TemplateStringsArray, ...args: any[]) => {
  const format = (str: string) => {
    const strSplitted = str.split("\n");

    return strSplitted.map(substr => substr.trim())
      .filter(substr => substr.length > 0)
      .join("\n");
  };

  if (typeof callSite === "string") {
    return format(callSite);
  }

  const output = callSite
    .slice(0, args.length + 1)
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    .map((text, i) => (i === 0 ? "" : args[i - 1]) + text)
    .join("");

  return format(output);
};

export const isBetween = (val: number, min: number, max: number) => val >= min && val <= max;
export const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

export const getRandom = <T>(arr: T[]): T => arr[Math.floor((Math.random() * arr.length))];

export const shuffle = <T>(arr: T[]) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export const toValidUrl = (url: string) => {
  if (url.startsWith("//")) return `https:${url}`;
  return url;
};

export const rgbaToHex = (val: string) => {
  const regex = /^rgba?\((\d{1,3})\s?,\s?(\d{1,3})\s?,\s?(\d{1,3})(?:,\s?\d.?\d*)?\s?\)$/;
  const matched = regex.exec(val);
  if (!matched) return val;

  const rgb = [matched[1], matched[2], matched[3]];

  return rgb.map(color => clamp(parseFloat(color), 0, 255)) as [number, number, number];
};

export default dedent;
