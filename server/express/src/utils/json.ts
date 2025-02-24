/**
 * Custom JSON serializer with proper formatting
 */
export function serialize(obj: unknown): string {
  try {
    const jsonString = JSON.stringify(obj, null, 2);
    JSON.parse(jsonString);

    return jsonString
      .split('\n')
      .map((line, index, array) => {
        const trimmed = line.trim();
        const isLastLine = index === array.length - 1;
        const isClosingBrace = trimmed === '}' || trimmed === ']';
        const isOpeningBrace = trimmed === '{' || trimmed === '[';
        
        if (isLastLine || isClosingBrace || isOpeningBrace) {
          return line;
        }
        
        return `${line},`;
      })
      .join('\n');
  } catch {
    return JSON.stringify(obj);
  }
}

/**
 * Parse JSON string with type safety
 */
export function parse<T>(str: string): T {
  try {
    return JSON.parse(str) as T;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    throw new Error(`Invalid JSON: ${message}`);
  }
}

/**
 * Format object for pretty printing
 */
export function formatJson(obj: unknown): string {
  return JSON.stringify(obj, null, 2);
}