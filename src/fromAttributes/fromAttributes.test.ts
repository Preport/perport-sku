import { fromAttributes } from '.';

describe('fromAttributes branches', () => {
  it('should fail to set elevated quality', () => {
    expect(
      fromAttributes(
        {
          defindex: 5021,
          quality: 15,
          id: 1,
          inventory: 1,
          level: 31,
          origin: 1,
          original_id: 1,
          quantity: 1,
          attributes: [{ defindex: 189, float_value: 13 }]
        },
        {} as any
      ).toString()
    ).toBe('5021;15');
  });
  it('should fail to set elevated quality to 11', () => {
    expect(
      fromAttributes(
        {
          defindex: 5021,
          quality: 11,
          id: 1,
          inventory: 1,
          level: 31,
          origin: 1,
          original_id: 1,
          quantity: 1,
          attributes: [{ defindex: 189, float_value: 11 }]
        },
        {} as any
      ).toString()
    ).toBe('5021;11');
  });
  it('should set elevated quality to 11', () => {
    expect(
      fromAttributes(
        {
          defindex: 5021,
          quality: 15,
          id: 1,
          inventory: 1,
          level: 31,
          origin: 1,
          original_id: 1,
          quantity: 1,
          attributes: [{ defindex: 189, float_value: 11 }]
        },
        {} as any
      ).toString()
    ).toBe('5021;15;strange');
  });
});
