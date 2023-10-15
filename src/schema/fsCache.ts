import fs from 'fs/promises';
import { Store, StoredData } from 'keyv';

export class FsCache implements Store<any> {
  private constructor() {
    this.prom = fs
      .mkdir('./tmp/caches', { recursive: true })
      .then(() => {
        fs.readdir('./tmp/caches/').then(d => {
          d.forEach(key => this.keys.add(key));
        });
      })
      .catch(err => {});
  }
  clear(): void | Promise<void> {
    this.keys.clear();
    return fs.rm('./tmp/caches', { recursive: true }).then(d => fs.mkdir('./tmp/caches'));
  }
  has?(key: string): boolean | Promise<boolean> {
    return this.keys.has(key);
  }
  getMany?(keys: string[]): StoredData<any>[] | Promise<StoredData<any>[]> | undefined {
    throw new Error('Method not implemented.');
  }

  private static cacheInstance: FsCache | undefined;
  private keys = new Set<string>();
  private prom: Promise<void>;
  public static get() {
    return (this.cacheInstance ??= new FsCache());
  }
  async get(key: string) {
    await this.prom;
    return this.keys.has(key) ? fs.readFile(`./tmp/caches/${key}`) : undefined;
  }
  async delete(key: string) {
    await this.prom;
    return this.keys.delete(key) ? fs.rm(`./tmp/caches/${key}`).then(d => true) : false;
  }
  async set(key: string, value: any, ttl?: number | undefined) {
    await this.prom;
    return fs.writeFile(`./tmp/caches/${key}`, value).then(() => {
      this.keys.add(key);
    });
  }
}
