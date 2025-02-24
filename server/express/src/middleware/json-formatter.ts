import { Request, Response, NextFunction } from 'express';

type JsonValue = 
  | string 
  | number 
  | boolean 
  | null 
  | JsonValue[] 
  | { [key: string]: JsonValue };

/**
 * Format value as JSON string
 */
function stringifyValue(value: JsonValue, indent = 0): string {
  if (value === null) return 'null';
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value !== 'object') return String(value);
  
  const spaces = ' '.repeat(indent);
  const nextIndent = indent + 2;
  
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    const items = value.map(item => stringifyValue(item as JsonValue, nextIndent));
    return `[\n${spaces}  ${items.join(`,\n${spaces}  `)}\n${spaces}]`;
  }
  
  const entries = Object.entries(value)
    .map(([key, val]) => `${spaces}  "${key}": ${stringifyValue(val as JsonValue, nextIndent)}`);
  
  if (entries.length === 0) return '{}';
  return `{\n${entries.join(',\n')}\n${spaces}}`;
}

/**
 * Middleware to format JSON responses
 */
export function jsonFormatter(_req: Request, res: Response, next: NextFunction): void {
  const _originalJson = res.json;
  
  res.json = function(body: unknown) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.send(stringifyValue(body as JsonValue));
    return res;
  };
  
  next();
}