import { parseItemName } from './parseItemName';

describe('Parse Item Name Branches', () => {
  it('Should parse the killstreak as 0', () => {
    const parsed = parseItemName(
      { fraudwarnings: [], name: 'Ballz', market_hash_name: 'Ballz', type: '' } as any,
      false,
      false,
      0,
      '',
      undefined,
      undefined
    );
    expect(parsed.killstreak).toBe(0);
  });
});
