import { fromSteamItem } from '.';

describe('fromSteamItemBranches', () => {
  it('should fail to convert a non TF2 item to sku', () => {
    expect(() => fromSteamItem({ appid: 1 } as any, {} as any)).toThrowError('Can not convert a non TF2 item to sku!');
  });

  it('should fail to get the quality', () => {
    expect(() =>
      fromSteamItem(
        {
          appid: 440,
          tags: [],
          actions: [{ name: 'Item Wiki Page...', link: 'http://wiki.teamfortress.com/scripts/itemredirect.php?id=31' }]
        } as any,
        {} as any
      )
    ).toThrowError("Couldn't get the quality");
  });

  it("should fail to get the sku's attrs", () => {
    expect(() =>
      fromSteamItem(
        {
          appid: 440,
          tags: [{ category: 'Quality', name: 'Unique' }],
          actions: [{ name: 'Item Wiki Page...', link: 'http://wiki.teamfortress.com/scripts/itemredirect.php?id=31' }]
        } as any,
        {
          qualities: new Map().set('Unique', 6),
          items: {}
        } as any
      )
    ).toThrowError("Couldn't get the sku's attrs");
  });

  it('should fail to get the defindex link', () => {
    expect(() =>
      fromSteamItem(
        {
          appid: 440,
          tags: [{ category: 'Quality', name: 'Unique' }],
          actions: [{ name: 'Item Wiki Page...' }]
        } as any,
        {} as any
      )
    ).toThrowError("Item doesn't have the defindex link!");
  });

  it('should fail to get the defindex', () => {
    expect(() =>
      fromSteamItem(
        {
          appid: 440,
          tags: [{ category: 'Quality', name: 'Unique' }],
          actions: [{ name: 'Item Wiki Page...', link: 'http://wiki.teamfortress.com/scripts/itemredirect.php?id=abc' }]
        } as any,
        {} as any
      )
    ).toThrowError("Item doesn't have the defindex link!");
  });

  it('should fail to parse fabricatorDesc name', () => {
    expect(() =>
      fromSteamItem(
        {
          appid: 440,
          tags: [{ category: 'Quality', name: 'Unique' }],
          actions: [{ name: 'Item Wiki Page...', link: 'http://wiki.teamfortress.com/scripts/itemredirect.php?id=1' }],
          descriptions: [{ value: 'This ballz can be applied to a 190.' }]
        } as any,
        {
          upgradables: new Map().set('190', 'Bat'),
          qualities: new Map().set('Unique', 6),
          items: { 1: { name: 'XD' } }
        } as any
      )
    ).toThrowError('Received string from fabricatorDesc name 190 was expecting a number');
  });
});
