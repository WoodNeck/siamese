import type Usage from "./Usage";

const reorderUsage = (usages: Usage[]) => {
  // 필수 - 선택 순으로 재배열
  const nonOptional = usages.filter(item => !item.optional);
  const optional = usages.filter(item => item.optional);

  return [...nonOptional, ...optional];
};

export default reorderUsage;
