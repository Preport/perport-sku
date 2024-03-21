import { FsCache } from './fsCache';
import fs from 'fs';

try {
  fs.rmSync('./tmp/caches-test/', { recursive: true });
} catch (err) {}
let cache: FsCache;
describe('FsCache', () => {
  beforeAll(() => {
    //@ts-expect-error private constructor
    cache = new FsCache('./tmp/caches-test/');
  });

  it('should create a cache', async () => {
    cache.set('test', 'test');
  });

  it('should get a cache', async () => {
    await cache.set('test31', 'test');
    const data = await cache.get('test31');
    expect(data).toBe('test');
  });

  it('should fail to get a cache', async () => {
    const data = await cache.get('test2');
    expect(data).toBeUndefined();
  });

  it('should check if a key exists', async () => {
    await cache.set('test66', 'test');
    const exists = await cache.has!('test66');
    expect(exists).toBe(true);
  });

  it('should remove a cache', async () => {
    await cache.set('testdel', 'test');
    const c = await cache.delete('testdel');
    expect(c).toBe(true);
  });

  it('should fail to remove a cache', async () => {
    const c = await cache.delete('testDelFalseTest');
    expect(c).toBe(false);
  });

  it('should throw an error on getMany', () => {
    expect(() => cache.getMany!(['test'])).toThrowError('Method not implemented.');
  });
  afterAll(async () => {
    await cache.clear();
  });
});
