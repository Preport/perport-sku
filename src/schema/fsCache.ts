import fs from 'fs/promises';
import type { Store, StoredData } from 'keyv';

export class FsCache implements Store<any> {
  private static cacheInstance: FsCache | undefined;
  private keys = new Set<string>();
  private prom: Promise<void>;
  public static get() {
    return (this.cacheInstance ??= new FsCache());
  }
  private path = './tmp/caches/';
  private constructor(path?: string) {
    if (path) this.path = path;
    this.prom = fs
      .mkdir(this.path, { recursive: true })
      .then(path => {
        // folder already exists read the directory
        if (path === undefined) return fs.readdir(this.path);
        // folder was just created don't read the directory
        return [];
      })
      .then(fileNames => {
        fileNames
          .filter(f => !f.endsWith('.tmp'))
          .forEach(key => {
            const keyDecoded = this.decodeKey(key);
            this.keys.add(keyDecoded);
          });
      });
  }
  clear(): void | Promise<void> {
    this.keys.clear();
    return fs.rm(this.path, { recursive: true }).then(d => fs.mkdir(this.path));
  }
  has?(key: string): boolean | Promise<boolean> {
    return this.keys.has(key);
  }
  getMany?(keys: string[]): StoredData<any>[] | Promise<StoredData<any>[]> | undefined {
    throw new Error('Method not implemented.');
  }

  private removeApiKey(key: string) {
    const index = key.indexOf('?');
    if (index !== -1) {
      const params = key.slice(index + 1).split('&');
      const keyIndex = params.findIndex(param => param.startsWith('key='));
      if (keyIndex !== -1) params.splice(keyIndex, 1);
      key = key.slice(0, index) + '?' + params.join('&');
    }
    return key;
  }

  private encodeKey(key: string) {
    return Buffer.from(key).toString('base64url');
  }
  private decodeKey(key: string) {
    return Buffer.from(key, 'base64url').toString();
  }
  async get(key: string) {
    await this.prom;
    key = this.removeApiKey(key);
    if (!this.keys.has(key)) return;
    const keyEncoded = this.encodeKey(key);
    return fs.readFile(`${this.path}/${keyEncoded}`, 'utf8');
  }
  async delete(key: string) {
    await this.prom;
    key = this.removeApiKey(key);
    if (!this.keys.has(key)) return false;
    const keyEncoded = this.encodeKey(key);
    return fs.rm(`${this.path}/${keyEncoded}`).then(() => true);
  }
  async set(key: string, value: any, ttl?: number | undefined) {
    await this.prom;
    key = this.removeApiKey(key);
    const keyEncoded = this.encodeKey(key);
    // safeWrite in case of crashes
    const fileName = `${this.path}/${keyEncoded}`;
    const tempFileName = `${fileName}.tmp`;
    await fs.writeFile(tempFileName, value).then(() => {
      this.keys.add(key);
    });
    return fs.rename(tempFileName, fileName);
  }
}
