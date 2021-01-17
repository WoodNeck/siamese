// Dedent from string, useful for multiline string template
const dedent = (callSite: TemplateStringsArray, ...args: string[]) => {
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
    .map((text, i) => (i === 0 ? "" : args[i - 1]) + text)
    .join("");

  return format(output);
};

export default dedent;
