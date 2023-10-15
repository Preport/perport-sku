import got from 'got';
import Keyv from 'keyv';

export async function getItemsGame() {
  const resp = await got.get(
    'https://raw.githubusercontent.com/SteamDatabase/GameTracking-TF2/master/tf/scripts/items/items_game.txt',
    {
      cache: new Keyv('offline://./tmp/caches')
    }
  );

  // we only care about static_attrs and attributes
  const staticAttrs = new Map<number, any>();
  const attrs = new Map<number, any>();

  const staticAttrRegex = /"(\d+)"\s+{.*"static_attrs"\s+{([\s\S]+?)}/g;

  //"(\d+)"\s+{[\s\S]+?(?:"static_attrs"\s+{(\s+"(.+)"\s+"(.+)")+\s+})?[\s\S]+?\n\t\t}
}
