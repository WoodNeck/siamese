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

export default dedent;
