import got from 'got';
import { TwoWayMap } from '..';
import { FsCache } from '../fsCache';

export async function getPaintKits() {
  const resp = await got.get(
    'https://raw.githubusercontent.com/SteamDatabase/GameTracking-TF2/master/tf/resource/tf_proto_obj_defs_english.txt',
    { cache: FsCache.get() }
  );

  const paintKits = new Map() as TwoWayMap;
  // match 1: id, match 2: name
  const paintKitRegex = /\t+"9_(\d+)_field .+?"\s+"(.+)"\n/g;
  let match: null | RegExpExecArray;

  while ((match = paintKitRegex.exec(resp.body))) {
    if (match[2].startsWith(`${match[1]}:`)) continue;
    paintKits.set(+match[1], match[2]);
    !paintKits.has(match[2]) && paintKits.set(match[2], +match[1]);
  }
  return paintKits;
}
