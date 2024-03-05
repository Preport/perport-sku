import CEconItem from 'steamcommunity/classes/CEconItem';
import { SkuType } from '../skuObject';

const killstreakRegex = /(?:(Specialized|Professional) )?Killstreak /;
const typeRegex = /.* - .*: \d+/;
export function parseItemName(
  item: CEconItem,
  isCrate: boolean,
  checkCrateNum: boolean,
  quality: number,
  qualityTag: string,
  killstreak: number | undefined,
  bQuality2: number | undefined
): Pick<SkuType, 'australium' | 'craftnumber' | 'killstreak' | 'quality2' | 'crateseries'> {
  const itemName: string =
    item.fraudwarnings
      .find(warning => warning.startsWith('This item has been renamed.'))
      ?.match(/^This item has been renamed\.\nOriginal name: \"(.+)\"$/)?.[1] || item.name;

  // A buggy item like "Specialized Killstreak Professional Killstreak Bat Kit Fabricator" can exist
  // So we should check the first Killstreak word

  if (killstreak == undefined) {
    const killstreakMatch = item.market_hash_name.match(killstreakRegex);
    killstreak = killstreakMatch ? 1 + [undefined, 'Specialized', 'Professional'].indexOf(killstreakMatch[1]) : 0;
  }

  const quality2 =
    bQuality2 ??
    (quality !== 11 && (item.type.match(typeRegex) || (quality === 15 && qualityTag === 'Strange')) ? 11 : undefined);
  const sku: {
    australium: boolean;
    craftnumber?: number;
    killstreak: number;
    quality2?: number;
    crateseries?: number;
  } = {
    australium: isAustralium(item.market_hash_name),
    craftnumber: !isCrate ? getCraftNumber(itemName.replace(/Chemistry Set Series #\d+/, '')) : undefined,
    killstreak,
    quality2
  };
  if (checkCrateNum) sku.crateseries = getCraftNumber(itemName);
  return sku;
}

function isAustralium(name: string) {
  return name.includes('Australium') && !name.includes('Australium Gold');
}

function getCraftNumber(name: string) {
  const match = name.match(/#(\d+)$/);
  if (match) return +match[1];
  return undefined;
}
