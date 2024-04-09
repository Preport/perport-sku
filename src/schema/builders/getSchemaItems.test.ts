import { getSchemaItems } from './getSchemaItems';

describe('getSchemaItems', () => {
  /* Removed to reduce the number of requests to the API
  test('fetches schema items', async () => {
    const apiKey = process.env.API_KEY || '';
    const { items } = await getSchemaItems(apiKey);

    expect(items).toBeInstanceOf(Map);
    expect(items.size).toBeGreaterThan(0);
    expect(items.get(190)).toBe('Bat');
    expect(items.get('Bat')).toBe(0);
    await new Promise(resolve => setTimeout(resolve, 7000));
  }, 15000);*/
  test('fails to fetch the schema items with a bad api key', async () => {
    const apiKey = 'bad-api-key';
    await expect(getSchemaItems(undefined, apiKey)).rejects.toThrow('403');
  });
});
