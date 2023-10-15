import CEconItem from 'steamcommunity/classes/CEconItem';
import { SkuType } from '../skuObject';

export function parseItemName(item: CEconItem, isCrate: boolean): Pick<SkuType, 'australium' | 'craftnumber'> {
  const itemName =
    item.fraudwarnings
      .find(warning => warning.startsWith('This item has been renamed.'))
      ?.match(/^This item has been renamed\.\nOriginal name: \"(.+)\"$/)?.[1] || item.name;

  return {
    australium: isAustralium(item.market_hash_name),
    craftnumber: !isCrate ? getCraftNumber(itemName) : undefined
  };
}

function isAustralium(name: string) {
  return name.includes('Australium') && !name.includes('Australium Gold');
}

function getCraftNumber(name: string) {
  const match = name.match(/#(\d+)$/);
  if (match) return +match[1];
  return undefined;
}
