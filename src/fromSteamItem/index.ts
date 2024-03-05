import type CEconItem from 'steamcommunity/classes/CEconItem';
import { Sku } from '../skuObject';
import { Schema } from '../schema';
import { parseItemName } from './parseItemName';
import { parseDescriptions } from './parseDescriptions';
import { parseAttributes } from './parseAttributes';

/**
 * **WARN** - If the item is renamed high craftnumber value can not be retrieved
 */
export function fromSteamItem(item: CEconItem, schema: Schema) {
  if (item.appid !== 440) throw new Error('Can not convert a non TF2 item to sku!');

  const defindex = getDefindex(item);
  const qualityTag = item.tags?.find(tag => tag.category === 'Quality') as QualityTagType | undefined;

  const quality: number | undefined = qualityTag ? schema.qualities.get(qualityTag.name) : undefined;
  if (quality === undefined) throw new Error("Couldn't get the quality");

  const attrs = schema.items[defindex];

  if (!attrs) throw new Error("Couldn't get the sku's attrs");

  const { attributes, isCrate, checkCrateNum } = parseAttributes(attrs);

  const isCosmetic = item.tags.some(
    tag => tag.category === 'Type' && (tag.name === 'Cosmetic' || tag.name === 'Usable Item')
  );
  const beforeItemNameParsed = {
    defindex,
    quality,
    normalized: false,

    ...attributes,
    ...parseDescriptions(item, schema, quality, isCosmetic, isCrate, attributes.strangeParts)
  };
  return new Sku(
    Object.assign(
      beforeItemNameParsed,
      parseItemName(
        item,
        isCrate,
        checkCrateNum,
        beforeItemNameParsed.quality,
        qualityTag!.name,
        beforeItemNameParsed.killstreak,
        beforeItemNameParsed.quality2
      )
    )
  );
}

function getDefindex(item: CEconItem) {
  const action = item.actions.find(action => action.name === 'Item Wiki Page...');

  const match = action?.link?.match(/^http:\/\/wiki\.teamfortress\.com\/scripts\/itemredirect\.php\?id=(\d+)/);
  if (!match) throw new Error("Item doesn't have the defindex link!");

  const defindex = +match[1];
  if (isNaN(defindex)) throw new Error(`Expected a number for defindex received ${match[1]} instead`);

  return defindex;
}

export type QualityTagType = {
  internal_name: string;
  name: string;
  category: string;
  color: string;
  category_name: string;
};
