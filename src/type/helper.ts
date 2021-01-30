export type RequiredField<T, K extends keyof T> = T & Required<Pick<T, K>>;
