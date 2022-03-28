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
export const getMinusCompensatedIndex = (idx: number, max: number) => idx < 0 ? clamp(idx + max, 0, max) : clamp(idx, 0, max);

export const randInt = (max: number) => Math.floor(Math.random() * (max + 1));
export const getRandom = <T>(arr: T[]): T => arr[randInt(arr.length - 1)];

export const shuffle = <T>(arr: T[]) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export const toValidURL = (url: string) => {
  if (url.startsWith("//")) return `https:${url}`;
  return url;
};

export const rgbaToHex = (val: string): `#${string}` | [number, number, number] => {
  const regex = /^rgba?\((\d{1,3})\s?,\s?(\d{1,3})\s?,\s?(\d{1,3})(?:,\s?\d.?\d*)?\s?\)$/;
  const matched = regex.exec(val);
  if (!matched) {
    return val.startsWith("#")
      ? val as `#${string}`
      : `#${val}`;
  }

  const rgb = [matched[1], matched[2], matched[3]];

  return rgb.map(color => clamp(parseFloat(color), 0, 255)) as [number, number, number];
};

export const userMention = (id: string) => `<@${id}>`;
export const roleMention = (id: string) => `<@&${id}>`;

export const range = (end: number): number[] => new Array(end).fill(0).map((_, idx) => idx);

export const parseArgs = (content: string) => {
  const args: string[] = [];
  let lastIdx = 0;
  let idx = 0;

  while (idx < content.length) {
    const char = content[idx];

    if (char === " ") {
      // Split args by blank space;
      // Exclude multiple blanks
      if (lastIdx !== idx) {
        args.push(content.substring(lastIdx, idx));
      }

      idx += 1;
      lastIdx = idx;
    } else if (char === "\"" && lastIdx === idx) {
      // Bundle args bound in double quotes
      // Exclude quotes only separated by blank space
      const endIdx = content.indexOf("\" ", idx + 1);
      if (endIdx > 0) {
        args.push(content.substring(idx + 1, endIdx));
        lastIdx = endIdx + 2;
        idx = lastIdx;
      } else if (content.endsWith("\"")) {
        // Case of all remaining string is bound in double quote
        args.push(content.substring(idx + 1, content.length - 1));
        lastIdx = content.length;
        idx = lastIdx;
        break;
      } else {
        idx += 1;
      }
    } else {
      idx += 1;
    }
  }

  // Append last arg
  if (lastIdx < content.length) {
    args.push(content.substring(lastIdx, content.length));
  }

  // For blank arg, add double quotes for it as Discord won't accept blank message
  return args.map(arg => arg === " " ? `"${arg}"` : arg);
};

export const groupBy = <T>(arr: T[], count: number) => {
  return new Array(Math.ceil(arr.length / count)).fill(0).map((_, idx) => {
    return arr.slice(idx * count, idx * count + count);
  });
};

export const toEmoji = (name: string, id: string) => `<:${name}:${id}>`;

export function staticImplements<T>() {
  return <U extends T>(constructor: U) => { constructor; }; // eslint-disable-line @typescript-eslint/no-unused-expressions
}
