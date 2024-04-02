export const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);
export const getMinusCompensatedIndex = (idx: number, max: number) => idx < 0 ? clamp(idx + max, 0, max) : clamp(idx, 0, max);
