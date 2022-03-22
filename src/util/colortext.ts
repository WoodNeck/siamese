export const green = {
  format: (text: string) => `+${text}`,
  lang: "diff"
};
export const red = {
  format: (text: string) => `-${text}`,
  lang: "diff"
};
export const yellow = {
  format: (text: string) => text,
  lang: "fix"
};
export const blue = {
  format: (text: string) => `[${text}]`,
  lang: "ini"
};
export const blue2 = {
  format: (text: string) => `#${text}`,
  lang: "md"
};
export const darkgreen = {
  format: (text: string) => text,
  lang: "yaml"
};
export const orange = {
  format: (text: string) => `[${text}]`,
  lang: "css"
};
export const orange2 = {
  format: (text: string) => `#${text}`,
  lang: "cs"
};
export const grey = {
  format: (text: string) => `#${text}`,
  lang: "yaml"
};
