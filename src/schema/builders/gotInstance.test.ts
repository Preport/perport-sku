import got from './gotInstance';
describe('gotInstance', () => {
  let etag = '';

  beforeAll(async () => {
    const res = await got.get('https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag', {
      cache: false
    });
    if (!res.headers.etag) throw new Error('No etag found');
    etag = res.headers.etag;
  });

  test('should get 200', async () => {
    const res = await got.head('https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag', {
      cache: false
    });
    expect(res.statusCode).toBe(200);
  });

  test('should get 304 therefore throw an error', () => {
    expect(
      got.head('https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag', {
        headers: { 'If-None-Match': etag },
        context: { isLiveUpdate: true },
        cache: false
      })
    ).rejects.toMatchObject({ name: 'LiveUpdateNotModifiedError' });
  });

  test('should get 200 with isLiveUpdate', async () => {
    const res = await got.head('https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag', {
      context: { isLiveUpdate: true },
      cache: false
    });
    expect(res.statusCode).toBe(200);
  });
});
