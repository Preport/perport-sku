import { parseDescriptions } from './parseDescriptions';

describe('Parse Descriptions Branches', () => {
  it('Should fail to parse paint', () => {
    expect(() =>
      parseDescriptions(
        { descriptions: [{ value: 'Paint Color: Bruh' }] } as any,
        { itemNames: new Map() } as any,
        6,
        false,
        false,
        []
      )
    ).toThrowError("Couldn't get the defindex of the paint Bruh");
  });

  it('Should fail to parse effect', () => {
    expect(() =>
      parseDescriptions(
        { descriptions: [{ value: '★ Unusual Effect: Bruh' }] } as any,
        { effects: new Map() } as any,
        6,
        false,
        false,
        []
      )
    ).toThrowError("Couldn't get the effect defindex of the effect Bruh");
  });

  it('Should fail to parse sheen', () => {
    expect(() =>
      parseDescriptions(
        { descriptions: [{ value: 'Killstreaks Active' }, { value: 'Sheen: Bruh' }] } as any,
        { sheens: new Map() } as any,
        6,
        false,
        false,
        []
      )
    ).toThrowError('Failed to parse Sheen to Number Received Unknown Sheen Bruh');
  });

  it('Should fail to parse killstreaker', () => {
    expect(() =>
      parseDescriptions(
        { descriptions: [{ value: 'Killstreaks Active' }, { value: 'Killstreaker: Bruh' }] } as any,
        { killstreakers: new Map() } as any,
        6,
        false,
        false,
        []
      )
    ).toThrowError('Failed to parse Killstreaker to Number Received Unknown Killstreaker Bruh');
  });

  it('Should fail to get outputItemName', () => {
    expect(() =>
      parseDescriptions(
        {
          descriptions: [
            { value: 'You will receive all of the following outputs once all of the inputs are fulfilled.' },
            { value: 'Bruh' }
          ]
        } as any,
        { itemNames: new Map() } as any,
        6,
        false,
        false,
        []
      )
    ).toThrowError("Couldn't get the item name from output description: Bruh");
  });

  it('Should fail to get item wear', () => {
    expect(() =>
      parseDescriptions(
        { descriptions: [{ value: 'Balls Grade pew pew gun (Used-in WW2)' }, { value: '✔ PaintKit XD' }] } as any,
        { itemNames: new Map() } as any,
        6,
        false,
        false,
        []
      )
    ).toThrowError('Item has unknown wear: Balls Grade pew pew gun (Used-in WW2)');
  });
});
