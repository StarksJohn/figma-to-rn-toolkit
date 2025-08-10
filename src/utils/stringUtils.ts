/**
 * String utility functions for code generation
 */
export class StringUtils {
  /**
   * Convert string to PascalCase
   */
  public static toPascalCase(str: string): string {
    return str
      .replace(/[^a-zA-Z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }

  /**
   * Convert string to camelCase
   */
  public static toCamelCase(str: string): string {
    const pascalCase = this.toPascalCase(str);
    return pascalCase.charAt(0).toLowerCase() + pascalCase.slice(1);
  }

  /**
   * Convert string to kebab-case
   */
  public static toKebabCase(str: string): string {
    return str
      .replace(/[^a-zA-Z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0)
      .map(word => word.toLowerCase())
      .join('-');
  }

  /**
   * Convert string to snake_case
   */
  public static toSnakeCase(str: string): string {
    return str
      .replace(/[^a-zA-Z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0)
      .map(word => word.toLowerCase())
      .join('_');
  }

  /**
   * Convert string to CONSTANT_CASE
   */
  public static toConstantCase(str: string): string {
    return this.toSnakeCase(str).toUpperCase();
  }

  /**
   * Sanitize string for use as a JavaScript identifier
   */
  public static sanitizeIdentifier(str: string): string {
    // Remove invalid characters and convert to camelCase
    let identifier = str
      .replace(/[^a-zA-Z0-9\s]/g, ' ')
      .trim();

    // Convert to camelCase
    identifier = this.toCamelCase(identifier);

    // Ensure it doesn't start with a number
    if (/^[0-9]/.test(identifier)) {
      identifier = 'component' + this.toPascalCase(identifier);
    }

    // Ensure it's not empty
    if (identifier.length === 0) {
      identifier = 'component';
    }

    return identifier;
  }

  /**
   * Pluralize a word (simple implementation)
   */
  public static pluralize(word: string): string {
    if (word.endsWith('y')) {
      return word.slice(0, -1) + 'ies';
    }
    if (word.endsWith('s') || word.endsWith('sh') || word.endsWith('ch') || word.endsWith('x') || word.endsWith('z')) {
      return word + 'es';
    }
    return word + 's';
  }

  /**
   * Singularize a word (simple implementation)
   */
  public static singularize(word: string): string {
    if (word.endsWith('ies')) {
      return word.slice(0, -3) + 'y';
    }
    if (word.endsWith('es')) {
      return word.slice(0, -2);
    }
    if (word.endsWith('s') && !word.endsWith('ss')) {
      return word.slice(0, -1);
    }
    return word;
  }

  /**
   * Capitalize first letter
   */
  public static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Uncapitalize first letter
   */
  public static uncapitalize(str: string): string {
    return str.charAt(0).toLowerCase() + str.slice(1);
  }

  /**
   * Truncate string with ellipsis
   */
  public static truncate(str: string, maxLength: number, suffix: string = '...'): string {
    if (str.length <= maxLength) {
      return str;
    }
    return str.substring(0, maxLength - suffix.length) + suffix;
  }

  /**
   * Remove extra whitespace and normalize line endings
   */
  public static normalizeWhitespace(str: string): string {
    return str
      .replace(/\r\n/g, '\n')  // Normalize line endings
      .replace(/\r/g, '\n')    // Normalize line endings
      .replace(/\t/g, '  ')    // Convert tabs to spaces
      .replace(/[ \t]+$/gm, '') // Remove trailing whitespace
      .replace(/\n{3,}/g, '\n\n'); // Limit consecutive newlines
  }

  /**
   * Indent all lines by a specified amount
   */
  public static indent(str: string, spaces: number = 2): string {
    const indentStr = ' '.repeat(spaces);
    return str
      .split('\n')
      .map(line => line.trim() ? indentStr + line : line)
      .join('\n');
  }

  /**
   * Remove common indentation from a multiline string
   */
  public static dedent(str: string): string {
    const lines = str.split('\n');
    
    // Find the minimum indentation (ignoring empty lines)
    let minIndent = Infinity;
    for (const line of lines) {
      if (line.trim()) {
        const indent = line.length - line.trimLeft().length;
        minIndent = Math.min(minIndent, indent);
      }
    }

    // Remove the common indentation
    if (minIndent === Infinity) minIndent = 0;
    return lines
      .map(line => line.length >= minIndent ? line.substring(minIndent) : line)
      .join('\n');
  }

  /**
   * Escape string for use in JavaScript/TypeScript string literals
   */
  public static escapeForString(str: string): string {
    return str
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
  }

  /**
   * Format a comment block
   */
  public static formatComment(comment: string, width: number = 80): string {
    const words = comment.split(/\s+/);
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      if (currentLine.length + word.length + 1 > width - 3) { // -3 for " * "
        if (currentLine) {
          lines.push(` * ${currentLine}`);
          currentLine = word;
        } else {
          lines.push(` * ${word}`);
        }
      } else {
        currentLine = currentLine ? `${currentLine} ${word}` : word;
      }
    }

    if (currentLine) {
      lines.push(` * ${currentLine}`);
    }

    return `/**\n${lines.join('\n')}\n */`;
  }

  /**
   * Generate a hash from a string (simple implementation)
   */
  public static hash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Check if string is empty or only whitespace
   */
  public static isEmpty(str: string): boolean {
    return !str || str.trim().length === 0;
  }

  /**
   * Check if string is a valid identifier
   */
  public static isValidIdentifier(str: string): boolean {
    return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(str);
  }

  /**
   * Extract words from a string
   */
  public static extractWords(str: string): string[] {
    return str
      .replace(/[^a-zA-Z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0);
  }

  /**
   * Generate a readable name from a technical string
   */
  public static humanize(str: string): string {
    return str
      .replace(/[_-]/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase())
      .trim();
  }

  /**
   * Create a slug from a string
   */
  public static slugify(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Count lines in a string
   */
  public static countLines(str: string): number {
    return str.split('\n').length;
  }

  /**
   * Get the file extension from a filename
   */
  public static getFileExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
  }

  /**
   * Remove file extension from filename
   */
  public static removeFileExtension(filename: string): string {
    const lastDotIndex = filename.lastIndexOf('.');
    return lastDotIndex > 0 ? filename.substring(0, lastDotIndex) : filename;
  }

  /**
   * Ensure string ends with a specific suffix
   */
  public static ensureSuffix(str: string, suffix: string): string {
    return str.endsWith(suffix) ? str : str + suffix;
  }

  /**
   * Ensure string starts with a specific prefix
   */
  public static ensurePrefix(str: string, prefix: string): string {
    return str.startsWith(prefix) ? str : prefix + str;
  }

  /**
   * Remove prefix from string if it exists
   */
  public static removePrefix(str: string, prefix: string): string {
    return str.startsWith(prefix) ? str.substring(prefix.length) : str;
  }

  /**
   * Remove suffix from string if it exists
   */
  public static removeSuffix(str: string, suffix: string): string {
    return str.endsWith(suffix) ? str.substring(0, str.length - suffix.length) : str;
  }
}