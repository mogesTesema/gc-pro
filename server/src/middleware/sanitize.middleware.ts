import { Request, Response, NextFunction } from 'express';

/**
 * Recursively strips dangerous characters from strings in an object.
 * Helps prevent XSS and basic NoSQL injection attacks.
 */
const sanitizeValue = (val: any): any => {
  if (typeof val === 'string') {
    return val
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }
  if (Array.isArray(val)) return val.map(sanitizeValue);
  if (val && typeof val === 'object') {
    const cleaned: Record<string, any> = {};
    for (const key of Object.keys(val)) {
      // Strip MongoDB operator injection (keys starting with $)
      if (key.startsWith('$')) continue;
      cleaned[key] = sanitizeValue(val[key]);
    }
    return cleaned;
  }
  return val;
};

/**
 * Express middleware that sanitizes req.body, req.query, and req.params.
 */
export const sanitizeInputs = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.body)   req.body   = sanitizeValue(req.body);
  if (req.query)  req.query  = sanitizeValue(req.query)  as any;
  if (req.params) req.params = sanitizeValue(req.params) as any;
  next();
};
