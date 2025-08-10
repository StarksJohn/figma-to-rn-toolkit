import { parseFigmaUrl, validateNodeId } from '../src/utils/figmaUtils';

describe('Figma Utils', () => {
  describe('parseFigmaUrl', () => {
    it('should parse valid Figma URL correctly', () => {
      const url = 'https://www.figma.com/design/VGULlnz44R0Ooe4FZKDxlhh4/My-Design?node-id=123:456';
      const result = parseFigmaUrl(url);
      
      expect(result.fileKey).toBe('VGULlnz44R0Ooe4FZKDxlhh4');
      expect(result.nodeId).toBe('123:456');
    });

    it('should handle URL without node-id', () => {
      const url = 'https://www.figma.com/design/VGULlnz44R0Ooe4FZKDxlhh4/My-Design';
      const result = parseFigmaUrl(url);
      
      expect(result.fileKey).toBe('VGULlnz44R0Ooe4FZKDxlhh4');
      expect(result.nodeId).toBeUndefined();
    });

    it('should throw error for invalid URL', () => {
      const url = 'https://invalid-url.com';
      
      expect(() => {
        parseFigmaUrl(url);
      }).toThrow('Invalid Figma URL format');
    });
  });

  describe('validateNodeId', () => {
    it('should validate correct node ID format', () => {
      expect(validateNodeId('123:456')).toBe(true);
      expect(validateNodeId('1:1')).toBe(true);
      expect(validateNodeId('999:888')).toBe(true);
    });

    it('should reject invalid node ID format', () => {
      expect(validateNodeId('123')).toBe(false);
      expect(validateNodeId('123-456')).toBe(false);
      expect(validateNodeId('abc:def')).toBe(false);
      expect(validateNodeId('')).toBe(false);
    });
  });
});