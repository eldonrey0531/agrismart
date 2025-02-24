/**
 * Make all properties in T optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Make all properties in T required recursively
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

/**
 * Get type of a Promise resolve value
 */
export type PromiseType<T> = T extends Promise<infer U> ? U : never;

/**
 * Make specific keys in T optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make specific keys in T required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Get types of function parameters
 */
export type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;

/**
 * Get return type of a function
 */
export type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : never;

/**
 * Extract the type of an array element
 */
export type ArrayElement<T extends readonly any[]> = T extends readonly (infer E)[] ? E : never;

/**
 * Create a type with only the specified keys of T
 */
export type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};