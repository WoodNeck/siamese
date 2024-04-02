// 디스코드 관련 유틸 함수
export const userMention = (id: string) => `<@${id}>`;
export const roleMention = (id: string) => `<@&${id}>`;
export const toEmoji = (name: string, id: string) => `<:${name}:${id}>`;
