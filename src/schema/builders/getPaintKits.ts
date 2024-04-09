import got from './gotInstance';
import { TwoWayMap } from '..';

export async function getPaintKits(isLiveUpdate: boolean = false) {
  const resp = await got.get(
    'https://raw.githubusercontent.com/SteamDatabase/GameTracking-TF2/master/tf/resource/tf_proto_obj_defs_english.txt',
    { context: { isLiveUpdate } }
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
