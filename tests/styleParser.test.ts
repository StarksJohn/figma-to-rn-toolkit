import { StyleParser } from '../src/parser/StyleParser';

describe('StyleParser', () => {
  describe('colorToString', () => {
    it('should convert RGBA color to rgb string', () => {
      const color = { r: 1, g: 0.5, b: 0, a: 1 };
      const result = StyleParser.colorToString(color);
      
      expect(result).toBe('rgb(255, 128, 0)');
    });

    it('should convert RGBA color to rgba string when alpha < 1', () => {
      const color = { r: 1, g: 0.5, b: 0, a: 0.8 };
      const result = StyleParser.colorToString(color);
      
      expect(result).toBe('rgba(255, 128, 0, 0.8)');
    });

    it('should handle edge cases', () => {
      const blackColor = { r: 0, g: 0, b: 0, a: 1 };
      expect(StyleParser.colorToString(blackColor)).toBe('rgb(0, 0, 0)');

      const whiteColor = { r: 1, g: 1, b: 1, a: 1 };
      expect(StyleParser.colorToString(whiteColor)).toBe('rgb(255, 255, 255)');
    });
  });

  describe('mergeStyles', () => {
    it('should merge two style objects', () => {
      const style1 = { backgroundColor: 'red', width: 100 };
      const style2 = { height: 200, borderRadius: 8 };
      
      const result = StyleParser.mergeStyles(style1, style2);
      
      expect(result).toEqual({
        backgroundColor: 'red',
        width: 100,
        height: 200,
        borderRadius: 8
      });
    });

    it('should override properties from first style with second', () => {
      const style1 = { backgroundColor: 'red', width: 100 };
      const style2 = { backgroundColor: 'blue', height: 200 };
      
      const result = StyleParser.mergeStyles(style1, style2);
      
      expect(result.backgroundColor).toBe('blue');
      expect(result.width).toBe(100);
      expect(result.height).toBe(200);
    });
  });

  describe('convertFigmaStyleToRN', () => {
    it('should convert basic Figma node to React Native style', () => {
      const figmaNode = {
        x: 10,
        y: 20,
        width: 100,
        height: 50,
        fills: [{
          type: 'SOLID',
          color: { r: 1, g: 0, b: 0, a: 1 }
        }],
        cornerRadius: 8
      };

      const result = StyleParser.convertFigmaStyleToRN(figmaNode);

      expect(result).toEqual({
        position: 'absolute',
        left: 10,
        top: 20,
        width: 100,
        height: 50,
        backgroundColor: 'rgb(255, 0, 0)',
        borderRadius: 8
      });
    });

    it('should handle node without fills', () => {
      const figmaNode = {
        x: 0,
        y: 0,
        width: 100,
        height: 50
      };

      const result = StyleParser.convertFigmaStyleToRN(figmaNode);

      expect(result).toEqual({
        position: 'absolute',
        left: 0,
        top: 0,
        width: 100,
        height: 50
      });
    });
  });
});