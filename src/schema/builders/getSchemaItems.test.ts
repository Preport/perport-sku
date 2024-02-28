import { getSchemaItems } from './getSchemaItems';

describe('getSchemaItems', () => {
  test('fetches schema items', async () => {
    const apiKey = process.env.API_KEY || '';
    const { items } = await getSchemaItems(apiKey);

    expect(items).toBeInstanceOf(Map);
    expect(items.size).toBeGreaterThan(0);
    expect(items.get(190)).toBe('Bat');
    expect(items.get('Bat')).toBe(0);
    await new Promise(resolve => setTimeout(resolve, 7000));
  }, 15000);
});
