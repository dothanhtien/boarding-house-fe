export const HttpStatus = {
  Unauthorized: 401,
  NotFound: 404,
  Conflict: 409,
} as const;

export type HttpStatus = (typeof HttpStatus)[keyof typeof HttpStatus];
