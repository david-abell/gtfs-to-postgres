// From https://stackoverflow.com/questions/64932525/is-it-possible-to-use-mapped-types-in-typescript-to-change-a-types-key-names

type CamelToSnake<T extends string, P extends string = ""> = string extends T
  ? string
  : T extends `${infer C0}${infer R}`
  ? CamelToSnake<
      R,
      `${P}${C0 extends Lowercase<C0> ? "" : "_"}${Lowercase<C0>}`
    >
  : P;

export type CamelKeysToSnake<T> = {
  [K in keyof T as CamelToSnake<Extract<K, string>>]: T[K];
};
