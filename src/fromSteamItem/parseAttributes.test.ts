import { parseAttributes } from './parseAttributes';

describe('parseAttributes', () => {
  it('should have target', () => {
    expect(
      parseAttributes({
        static_attrs: { 'set supply crate series': 1, 'tool target item': 5 }
      } as any).attributes.target
    ).toBe(5);
  });

  it('should have target from attrs', () => {
    expect(
      parseAttributes({
        static_attrs: { 'set supply crate series': 1 },
        attributes: { 'tool target item': { value: 5 } }
      } as any).attributes.target
    ).toBe(5);
  });
});
