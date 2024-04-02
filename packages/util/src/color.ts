import { COLOR } from "@siamese/color";

import { clamp } from "./math";

export const rgbaToHex = (val: string): `#${string}` | [number, number, number] => {
  const regex = /^rgba?\((\d{1,3})\s?,\s?(\d{1,3})\s?,\s?(\d{1,3})(?:,\s?\d.?\d*)?\s?\)$/;
  const matched = regex.exec(val);
  if (!matched) {
    if (val.startsWith("hsl")) return COLOR.BOT;

    return val.startsWith("#")
      ? val as `#${string}`
      : `#${val}`;
  }

  const rgb = [matched[1], matched[2], matched[3]];

  return rgb.map(color => clamp(parseFloat(color), 0, 255)) as [number, number, number];
};
