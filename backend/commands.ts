export const COMMANDS = Object.freeze({
  CREATE_PRODUCT: 1,
  GET_PRODUCT: 2,
  UPDATE_PRODUCT: 3,
  DELETE_PRODUCT: 4,
  LIST_PRODUCTS: 5,
} as const);

export type CommandKey = keyof typeof COMMANDS;
export type CommandCode = (typeof COMMANDS)[CommandKey];
