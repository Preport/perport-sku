import { getSchemaItems } from './items';

describe('getSchemaItems', () => {
  test('fetches schema items', async () => {
    const apiKey = 'YOUR_API_KEY_HERE';
    const items = await getSchemaItems(apiKey);

    expect(items).toBeInstanceOf(Map);
    expect(items.size).toBeGreaterThan(0);
    expect(items.get(190)).toBe('Bat');
    expect(items.get('Bat')).toBe(0);
  }, 15000);
});
