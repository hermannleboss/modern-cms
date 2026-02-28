import { Request } from 'express';

/**
 * Extract a route parameter as a string.
 * Express 5 types params as string | string[]; this helper normalizes.
 */
export function getParam(req: Request, name: string): string {
  const value = req.params[name];
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}
