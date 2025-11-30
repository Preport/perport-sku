import type CEconItem from 'steamcommunity/classes/CEconItem';
import { SkuType } from '../skuObject';
import type { Schema } from '../schema';

type Descriptions = { value: string; color: string }[];
//TODO: We are iterating over the descriptions multiple times for no reason. If performance ever becomes an issue refactor this!
export function parseDescriptions(
  item: CEconItem,
  schema: Schema,
  quality: number,
  isCosmetic: boolean,
  isCrate: boolean,
  staticParts: number[] | undefined
): Pick<
  SkuType,
  | 'festive'
  | 'uncraftable'
  | 'effect'
  //| 'killstreak'
  | 'killstreaker'
  | 'sheen'
  | 'target'
  | 'paint'
  | 'paintKit'
  | 'wear'
  | 'quality2'
  | 'spells'
  | 'strangeParts'
> &
  Partial<Pick<SkuType, 'killstreak'>> {
  const skObj: {
    festive: boolean;
    uncraftable: boolean;
    effect?: number;
    target?: number;
    paint?: number;
    quality2?: number;
    spells?: number[];
    strangeParts?: number[];
  } = {
    festive: false,
    uncraftable: false,
    effect: effect(item.descriptions, schema, isCrate),
    quality2: quality !== 11 && hasDescription(item.descriptions, 'Strange Stat Clock Attached') ? 11 : undefined,
    spells: spells(item.descriptions, schema),
    strangeParts: parts(item.descriptions, schema, isCosmetic, staticParts || [])
  };

  const targetDefindex = target(item.descriptions, schema);
  if (targetDefindex !== undefined) skObj.target = targetDefindex;

  const paintId = paint(item.descriptions, schema);
  if (paintId !== undefined) skObj.paint = paintId;
  for (const desc of item.descriptions) {
    switch (desc.value) {
      case 'Festivized':
        skObj.festive = true;
        continue;
      case '( Not Usable in Crafting )':
      case '( Not Tradable, Marketable, or Usable in Crafting )':
      case '( Not Tradable, Marketable, Usable in Crafting, or Gift Wrappable )':
        skObj.uncraftable = true;
        continue;
    }
  }

  return Object.assign(
    skObj,
    killstreak(item.descriptions, schema),
    output(item.descriptions, schema),
    paintKit(item.descriptions, schema)
  );
}

function hasDescription(descriptions: Descriptions, ...descValues: string[]) {
  return descriptions.some(desc => descValues.includes(desc.value));
}
function getDescriptionRest(descriptions: Descriptions, descValueStartsWith: string) {
  const str: string | undefined = descriptions.find(desc => desc.value?.startsWith(descValueStartsWith))?.value;
  return str?.slice(descValueStartsWith.length);
}
function getDescriptionsAfter(descriptions: Descriptions, descValue: string) {
  let index = -1;
  let endIndex = descriptions.length;
  let i = 0;
  while (i < descriptions.length) {
    let desc = descriptions[i];
    if (index !== -1 && desc.value === ' ') {
      endIndex = i;
      break;
    } else if (desc.value === descValue) {
      index = i + 1;
    }
    i++;
  }
  if (index === -1) return;

  return descriptions.slice(index, endIndex);
}

// Paint
function paint(descriptions: Descriptions, schema: Schema) {
  const paintStr = getDescriptionRest(descriptions, 'Paint Color: ');
  if (!paintStr) return;

  // No need to get it from upgradables because it's a paint can
  const paintDefIndex = schema.itemNames.get(paintStr);
  if (!paintDefIndex) throw new Error(`Couldn't get the defindex of the paint ${paintStr}`);

  return +schema.items[paintDefIndex].attributes?.['set item tint RGB'].value;
}

// Unusual effect
function effect(descriptions: Descriptions, schema: Schema, isCrate: boolean) {
  if (isCrate) return undefined;
  const effectDesc = getDescriptionRest(descriptions, '★ Unusual Effect: ');
  if (!effectDesc) return undefined;

  // Hardcode Invalid Particle
  const eff = effectDesc === 'Invalid Particle' ? 0 : schema.effects.get(effectDesc.toLowerCase());
  if (eff === undefined) throw new Error(`Couldn't get the effect defindex of the effect ${effectDesc}`);
  return eff;
}
// KS
function killstreak(
  descriptions: Descriptions,
  schema: Schema
): Pick<SkuType, 'killstreaker' | 'sheen'> & Partial<Pick<SkuType, 'killstreak'>> {
  if (!hasDescription(descriptions, 'Killstreaks Active'))
    return {
      killstreak: 0
    };

  // Some early bugged items can have kt-3 without sheen?
  let sheen: number | undefined;
  let killstreaker: number | undefined;
  const sheenStr = getDescriptionRest(descriptions, 'Sheen: ');
  if (sheenStr) {
    sheen = schema.sheens.get(sheenStr);

    if (!sheen) throw new Error(`Failed to parse Sheen to Number Received Unknown Sheen ${sheenStr}`);
  }

  const killstreakerStr = getDescriptionRest(descriptions, 'Killstreaker: ');

  if (killstreakerStr) {
    killstreaker = schema.killstreakers.get(killstreakerStr);

    if (!killstreaker)
      throw new Error(`Failed to parse Killstreaker to Number Received Unknown Killstreaker ${killstreakerStr}`);
  }

  // Killstreak tier should be parsed from item's name
  return {
    //killstreak: killstreaker !== undefined ? 3 : sheen !== undefined ? 2 : 1,
    sheen,
    killstreaker
  };
}

const targetRegex = /^This .+ can be applied to a (?:(.+?)\.  |(.+)\.)/;
function target(descriptions: Descriptions, schema: Schema) {
  for (const desc of descriptions) {
    const match = desc.value.match(targetRegex);
    if (!match) continue;
    const name = match[1] || match[2];
    const defindex = schema.upgradables.get(name) ?? schema.itemNames.get(name);
    if (typeof defindex === 'string')
      throw new Error(`Received string from fabricatorDesc name ${name} was expecting a number`);
    return defindex;
  }
}

const KitKillstreakRegex = /^\((?:Killstreaker: (.+), )?(?:Sheen: (.+))\)$/;

const OutputNameRegex = /(?:^\w+ Killstreak (.*?) ?Kit$)|(?:^(.+) Strangifier$)|(?:^Collector's (.+)$)/;

function output(descriptions: Descriptions, schema: Schema) {
  const descs = getDescriptionsAfter(
    descriptions,
    'You will receive all of the following outputs once all of the inputs are fulfilled.'
  ) as { value: string }[];
  if (!descs) return {};

  const returnVal: {
    killstreak?: number;
    sheen?: number;
    killstreaker?: number;
    output?: number;
    target?: number;
    outputQuality?: number;
  } = {};

  //const itemName = descs[0].value.match(KitNameRegex)?.[1];

  const outputItemName = descs[0].value.match(OutputNameRegex);

  if (!outputItemName) throw new Error(`Couldn't get the item name from output description: ${descs[0].value}`);

  const validItem = outputItemName.find((v, i) => i !== 0 && v !== undefined);
  if (validItem) {
    // https://steamcommunity.com/profiles/76561197991477148/inventory/#440_2_7029379105
    const defindex = schema.upgradables.get(validItem) ?? schema.itemNames.get(validItem);
    returnVal.target = defindex;
  }

  // Check for undefined instead of just if(outputItemName[1]) because it can be an empty string
  // And some buggy items like: Specialized Killstreak Kit exist
  // Kit Fabricator
  if (outputItemName[1] !== undefined) {
    const descName = descs[1].value;
    let match = descName.match(KitKillstreakRegex)!;
    //returnVal.killstreak = 2;
    returnVal.output = 6523;
    if (match[1]) {
      returnVal.killstreaker = schema.killstreakers.get(match[1]);
      //returnVal.killstreak = 3;
      returnVal.output = 6526;
    }
    returnVal.outputQuality = 6;
    returnVal.sheen = schema.sheens.get(match[2]);
  }
  // Chem Set Strangifier
  else if (outputItemName[2] !== undefined) {
    returnVal.outputQuality = 6;
    returnVal.output = 6522;
  }
  // Chem Set Collector's
  else if (outputItemName[3] !== undefined) {
    returnVal.outputQuality = 14;
    returnVal.output = returnVal.target;
    delete returnVal.target;
  }
  return returnVal;
}

const wearRegex = /^.+ Grade (.+) \((.+)\)/;

const wears = Object.freeze(['Factory New', 'Minimal Wear', 'Field-Tested', 'Well-Worn', 'Battle Scarred']);
function paintKit(descriptions: Descriptions, schema: Schema): { wear?: number; paintKit?: number; quality?: number } {
  let wearDesc: null | undefined | RegExpMatchArray;
  let paintKitName: undefined | string;
  for (const desc of descriptions) {
    !wearDesc && (wearDesc = (desc.value as string).match(wearRegex));

    if (
      wearDesc &&
      !paintKitName &&
      (desc.value.startsWith('✔ ') || desc.value.startsWith('★ ')) &&
      !desc.value.startsWith('★ Unusual Effect: ')
    ) {
      const suffixIsWeaponName = (desc.value as string).endsWith(wearDesc[1]);
      // 'War Paint' length
      const padding = suffixIsWeaponName ? wearDesc[1].length : 9;
      paintKitName = desc.value.slice(2, -(padding + 1));
      break;
    }
  }
  if (!wearDesc || !paintKitName) return {};

  const wear = wears.indexOf(wearDesc[2]) + 1;

  if (wear === 0) throw new Error(`Item has unknown wear: ${wearDesc[0]}`);

  const kit = schema.paintKits.get(paintKitName)!;
  return { wear, paintKit: kit, quality: 15 };
}

function spells(descriptions: Descriptions, schema: Schema) {
  let spells: string[] = [];
  for (const desc of descriptions) {
    if (desc.value.startsWith('Halloween: ') && desc.value.endsWith(' (spell only active during event)')) {
      // sliced by 'halloween: ' length, - ' (spell only active during event)' length;
      spells.push(desc.value.slice(11, -33));
    }
  }

  return spells.length > 0 ? spells.map(spell => schema.spells.get(spell)!) : undefined;
}

// const partRegex = /^\t*\((.+?)(?: \(.+\))?: \d+\)$/;
const partRegex = /(?:^\((.+?)(?: \(.+\))?: \d+\)$)|(?:^\s+(.+?)): \d+$/;
function parts(descriptions: Descriptions, schema: Schema, isCosmetic: boolean, staticParts: number[]) {
  let parts: string[] = [];
  for (const desc of descriptions) {
    let tmp: RegExpMatchArray | null | undefined;
    if (desc.color === '756b5e' && (tmp = desc.value.match(partRegex))) {
      parts.push(tmp[1] ?? tmp[2]);
    }
  }
  const map = isCosmetic ? schema.cosmeticParts : schema.parts;
  const result =
    parts.length > 0
      ? parts
          .map(part => map.get(part)! ?? (isCosmetic ? schema.parts.get(part)! : undefined))
          .filter(part => part !== undefined)
      : undefined;
  return !result || result?.length === 0
    ? (staticParts.length && staticParts) || undefined
    : staticParts.concat(result);
}
