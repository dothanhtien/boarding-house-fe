export const HttpStatus = {
  BadRequest: 400,
  Unauthorized: 401,
  Forbidden: 403,
  NotFound: 404,
  Conflict: 409,
} as const;

export type HttpStatus = (typeof HttpStatus)[keyof typeof HttpStatus];
