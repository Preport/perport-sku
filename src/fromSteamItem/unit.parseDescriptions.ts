import { killstreak } from '../src/parseDescriptions';

describe('killstreak', () => {
  test('returns correct killstreak value', () => {
    const descriptions = {
      'Killstreaks Active': '1',
      'Sheen: Hot Rod': '',
      'Killstreaker: Flames': ''
    };
    const schema = {
      sheens: {
        'Hot Rod': 1
      },
      killstreakers: {
        Flames: 2
      }
    };

    const result = killstreak(descriptions, schema);

    expect(result).toEqual({
      killstreak: 3,
      sheen: 1,
      killstreaker: 2
    });
  });

  test('handles missing descriptions', () => {
    const descriptions = {};
    const schema = {};

    const result = killstreak(descriptions, schema);

    expect(result).toEqual({
      killstreak: 0
    });
  });

  test('handles missing sheen', () => {
    const descriptions = {
      'Killstreaks Active': '1',
      'Killstreaker: Flames': ''
    };
    const schema = {
      sheens: {},
      killstreakers: {
        Flames: 2
      }
    };

    const result = killstreak(descriptions, schema);

    expect(result).toEqual({
      killstreak: 2,
      sheen: undefined,
      killstreaker: 2
    });
  });

  test('handles missing killstreaker', () => {
    const descriptions = {
      'Killstreaks Active': '1',
      'Sheen: Hot Rod': ''
    };
    const schema = {
      sheens: {
        'Hot Rod': 1
      },
      killstreakers: {}
    };

    const result = killstreak(descriptions, schema);

    expect(result).toEqual({
      killstreak: 2,
      sheen: 1,
      killstreaker: undefined
    });
  });
});
