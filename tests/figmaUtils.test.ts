import { FigmaUtils } from '../src/utils/figmaUtils';

describe('Figma Utils', () => {
  describe('parseUrl', () => {
    it('should parse valid Figma URL correctly', () => {
      const url = 'https://www.figma.com/design/VGULlnz44R0Ooe4FZKDxlhh4/My-Design?node-id=123-456';
      const result = FigmaUtils.parseUrl(url);

      expect(result.fileKey).toBe('VGULlnz44R0Ooe4FZKDxlhh4');
      expect(result.nodeId).toBe('123:456');
    });

    it('should handle URL without node-id', () => {
      const url = 'https://www.figma.com/design/VGULlnz44R0Ooe4FZKDxlhh4/My-Design';
      const result = FigmaUtils.parseUrl(url);

      expect(result.fileKey).toBe('VGULlnz44R0Ooe4FZKDxlhh4');
      expect(result.nodeId).toBeUndefined();
    });

    it('should throw error for invalid URL', () => {
      const url = 'https://invalid-url.com';

      expect(() => {
        FigmaUtils.parseUrl(url);
      }).toThrow();
    });
  });

  describe('normalizeNodeId', () => {
    it('should normalize colon-separated node IDs', () => {
      expect(FigmaUtils.normalizeNodeId('123:456')).toBe('123:456');
      expect(FigmaUtils.normalizeNodeId('1:1')).toBe('1:1');
    });

    it('should convert dash-separated IDs to colon format', () => {
      expect(FigmaUtils.normalizeNodeId('123-456')).toBe('123:456');
      expect(FigmaUtils.normalizeNodeId('1-1')).toBe('1:1');
    });
  });

  describe('isValidFigmaUrl', () => {
    it('should return true for valid Figma URLs', () => {
      expect(FigmaUtils.isValidFigmaUrl('https://www.figma.com/design/abc123/My-Design')).toBe(true);
      expect(FigmaUtils.isValidFigmaUrl('https://www.figma.com/file/abc123/My-Design?node-id=1-2')).toBe(true);
    });

    it('should return false for invalid URLs', () => {
      expect(FigmaUtils.isValidFigmaUrl('https://invalid-url.com')).toBe(false);
      expect(FigmaUtils.isValidFigmaUrl('')).toBe(false);
    });
  });
});