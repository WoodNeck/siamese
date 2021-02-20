export type RequiredField<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type ValueOf<T> = T[keyof T];
export type LiteralUnion<T extends U, U = string> = T | (Pick<U, never> & {_?: never});

export type AnyFunction = (...args: any[]) => any;
export type NoArguments = undefined | null | void | never;
export type EventMap = Record<string, any>;
export type EventKey<T extends EventMap> = string & keyof T;
export type EventCallback<T extends EventMap, K extends EventKey<T>>
  = T[K] extends NoArguments
    ? () => any
    : T[K] extends AnyFunction
      ? T[K]
      : (event: T[K]) => any;
