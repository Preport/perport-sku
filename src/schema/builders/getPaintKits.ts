import got from 'got';
import Keyv from 'keyv';
import { TwoWayMap } from '../schema';

export async function getPaintKits() {
  const resp = await got.get(
    'https://raw.githubusercontent.com/SteamDatabase/GameTracking-TF2/master/tf/resource/tf_proto_obj_defs_english.txt',
    { cache: new Keyv('offline://./tmp/caches') }
  );

  const paintKits = new Map() as TwoWayMap;
  // match 1: id, match 2: name
  const paintKitRegex = /\t+"9_(\d+)_field .+"\s+"(.+)"/g;
  let match: null | RegExpExecArray;

  while ((match = paintKitRegex.exec(resp.body))) {
    if (match[2].startsWith(`${match[1]}:`)) continue;
    paintKits.set(+match[1], match[2]);
    paintKits.set(match[2], +match[1]);
  }
}
