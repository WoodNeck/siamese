import type Usage from "./Usage";

export type UsageOptionType<T extends Usage[]> = {
  [K in keyof T]: ReturnType<T[K]["getTextValue"]>;
}
