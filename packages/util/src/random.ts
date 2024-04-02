/**
 * 0부터 max까지의 임의의 숫자를 반환 (max를 포함)
 */
export const randInt = (max: number) => Math.floor(Math.random() * (max + 1));
export const shuffle = <T>(arr: T[]) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};
export const getRandom = <T>(arr: T[]): T => arr[randInt(arr.length - 1)];
