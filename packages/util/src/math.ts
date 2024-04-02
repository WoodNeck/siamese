export const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

// nCr
export const combinations = (n: number, r: number): number => {
  if (r > n) return 0;

  let numerator = 1;
  let denominator = 1;

  for (let i = 0; i < r; i++) {
    numerator *= (n - i);
    denominator *= (r - i);
  }

  return numerator / denominator;
};
