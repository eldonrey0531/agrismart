class JsonFormatter {
  private static indentSize = 2;

  public static format(data: unknown): string {
    return this.formatWithCommas(data);
  }

  private static formatWithCommas(value: unknown, depth = 0): string {
    if (value === null || value === undefined) {
      return 'null';
    }

    if (typeof value === 'string') {
      return `"${value}"`;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    if (Array.isArray(value)) {
      if (value.length === 0) return '[]';
      
      const indent = ' '.repeat(depth * this.indentSize);
      const childIndent = ' '.repeat((depth + 1) * this.indentSize);
      const items = value
        .map((item, i) => {
          const comma = i < value.length - 1 ? ',' : '';
          return `${childIndent}${this.formatWithCommas(item, depth + 1)}${comma}`;
        })
        .join('\n');
      
      return `[\n${items}\n${indent}]`;
    }

    if (typeof value === 'object') {
      const obj = value as Record<string, unknown>;
      if (Object.keys(obj).length === 0) return '{}';
      
      const indent = ' '.repeat(depth * this.indentSize);
      const childIndent = ' '.repeat((depth + 1) * this.indentSize);
      const entries = Object.entries(obj)
        .map(([key, val], i, arr) => {
          const comma = i < arr.length - 1 ? ',' : '';
          return `${childIndent}"${key}": ${this.formatWithCommas(val, depth + 1)}${comma}`;
        })
        .join('\n');
      
      return `{\n${entries}\n${indent}}`;
    }

    return String(value);
  }
}

export default JsonFormatter;
