import { Sku } from '../src/skuObject';
describe('Sku Class', () => {
  test('Converts 5021;6 to object then back to string', () => {
    expect(new Sku('5021;6').toString()).toBe('5021;6');
  });

  test('Test a made up item that has all the attributes', () => {
    const sku = new Sku(
      '5021;63;u44;australium;uncraftable;w3;pk2023;strange;kt-97;td-71;festive;n3169;c6931;od-24;oq-467;p3188496;sp24,45;pt17,20;sh3161;ks74135'
    );
    expect(sku.toString()).toBe(
      '5021;63;u44;australium;uncraftable;w3;pk2023;strange;kt-97;td-71;festive;n3169;c6931;od-24;oq-467;p3188496;sp24,45;pt17,20;sh3161;ks74135'
    );

    expect(sku).toEqual(
      expect.objectContaining({
        defindex: 5021,
        quality: 63,
        effect: 44,
        australium: true,
        uncraftable: true,
        wear: 3,
        paintKit: 2023,
        quality2: 11,
        killstreak: 97,
        normalized: false,
        target: 71,
        festive: true,
        craftnumber: 3169,
        crateseries: 6931,
        output: 24,
        outputQuality: 467,
        paint: 3188496,
        spells: [24, 45],
        strangeParts: [17, 20],
        sheen: 3161,
        killstreaker: 74135
      } as Sku)
    );

    expect(sku.toString(true)).toBe(
      '5021;63;u44;australium;uncraftable;w3;pk2023;strange;kt-97;td-71;festive;n3169;c6931;od-24;oq-467'
    );
  });

  test('Strong compare skus', () => {
    expect(new Sku('5021;6').compare('5021;6')).toBe(true);
    expect(new Sku('5021;6;p91567;sp43,21').compare('5021;6')).toBe(false);
    expect(new Sku('5021;6;kt-2').compare('5021;6;kt-1')).toBe(false);

    expect(Sku.compare('5021;6', '5021;6')).toBe(true);
    expect(Sku.compare('5021;6;p91567;sp43,21', '5021;6')).toBe(false);
    expect(Sku.compare('5021;6;kt-2', '5021;6;kt-1')).toBe(false);

    expect(Sku.compare('5021;6', new Sku('5021;6'))).toBe(true);
    expect(Sku.compare('5021;6;p91567;sp43,21', new Sku('5021;6'))).toBe(false);
    expect(Sku.compare('5021;6;kt-2', new Sku('5021;6;kt-1'))).toBe(false);

    expect(Sku.compare('5021;6;sp3', '5021;6;sp4', false)).toBe(false);
    expect(Sku.compare('5021;6;sp3,4', '5021;6;sp3,4', false)).toBe(true);

    expect(Sku.compare('5021;6;sp3;sh3', '5021;6;sp4;sh3', false, 'spells')).toBe(true);
  });

  test('Weak compare skus', () => {
    expect(new Sku('5021;6').compare('5021;6', true)).toBe(true);
    expect(new Sku('5021;6;p91567;sp43,21').compare('5021;6', true)).toBe(true);
    expect(new Sku('5021;6;kt-2').compare('5021;6;kt-1', true)).toBe(false);

    expect(Sku.compare('5021;6', '5021;6', true)).toBe(true);
    expect(Sku.compare('5021;6;p91567;sp43,21', '5021;6', true)).toBe(true);
    expect(Sku.compare('5021;6;kt-2', '5021;6;kt-1', true)).toBe(false);

    expect(Sku.compare('5021;6', new Sku('5021;6'), true)).toBe(true);
    expect(Sku.compare('5021;6;p91567;sp43,21', new Sku('5021;6'), true)).toBe(true);
    expect(Sku.compare('5021;6;kt-2', new Sku('5021;6;kt-1'), true)).toBe(false);
  });

  test('Check Errors', () => {
    const sku = new Sku('5021;6');

    //@ts-expect-error Shut your ass up typescript
    sku.australium = 'xd';
    expect(sku.toString.bind(sku)).toThrowError();

    expect(() => new Sku('89498894;2;strbna')).toThrowError();
    expect(() => new Sku('245')).toThrowError();
    expect(() => new Sku('')).toThrowError();
  });
});
