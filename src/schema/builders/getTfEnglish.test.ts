import { getTfEnglish } from './getTfEnglish';

describe('Get Tf English File', () => {
  test('returns a valid killstreaker map', async () => {
    const data = await getTfEnglish();
    const killstreakers = data.killstreakers;

    expect(killstreakers).toBeInstanceOf(Map);
    expect(killstreakers.size).toBeGreaterThan(0);
    expect(killstreakers.get(2005)).toBe('Flames');
    expect(killstreakers.get('Flames')).toBe(2005);
  });

  test('returns a valid sheen map', async () => {
    const data = await getTfEnglish();
    const sheens = data.sheens;

    expect(sheens).toBeInstanceOf(Map);
    expect(sheens.size).toBeGreaterThan(0);
    expect(sheens.get(1)).toBe('Team Shine');
    expect(sheens.get('Team Shine')).toBe(1);
  });
});
