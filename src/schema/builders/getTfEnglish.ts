import got from 'got';
import Keyv from 'keyv';
import type { TwoWayMap } from '../schema';

export async function getTfEnglish() {
  const resp = await got.get(
    'https://raw.githubusercontent.com/SteamDatabase/GameTracking-TF2/master/tf/resource/tf_english.txt',
    {
      cache: new Keyv('offline://./tmp/caches')
    }
  );

  const killstreakers = new Map() as TwoWayMap;
  const sheens = new Map() as TwoWayMap;

  // match 1: id, match 2: name
  const ksRegex = /\n"Attrib_KillStreakEffect(\d+)"\t"(.+)"/g;
  const sheenRegex = /\n"Attrib_KillStreakIdleEffect(\d+)"\t"(.+)"/g;

  let match: null | RegExpExecArray;
  // JS regexes are stateful so this works
  while ((match = ksRegex.exec(resp.body))) {
    killstreakers.set(+match[1], match[2]);
    killstreakers.set(match[2], +match[1]);
  }
  while ((match = sheenRegex.exec(resp.body))) {
    killstreakers.set(+match[1], match[2]);
    killstreakers.set(match[2], +match[1]);
  }

  return { killstreakers, sheens };
}

export type KillstreakerSheenType = {
  [nameOrID: string]: number | string;
};