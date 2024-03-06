import { Schema } from '../schema';
import { Sku, SkuType } from '../skuObject';
import { AttributeItemStripped, ItemAttribute } from './attributes';

const PARTICLE_EFFECT = 134;
const TAUNT_PARTICLE_EFFECT = 2041;

const RGB_TINT_1 = 142;
const CRATE_SERIES = 187;
const ELEVATE_QUALITY = 189;
const CRAFT_NUMBER = 229;
const TEXTURE_WEAR = 725;
const PAINT_KIT = 834;
const TARGET_DEFINDEX = 2012;
const KILLSTREAKER = 2013;
const SHEEN = 2014;
const KILLSTREAK_TIER = 2025;
const IS_AUSTRALIUM = 2027;
const IS_FESTIVIZED = 2053;

// parts that can be applied by the user
const STRANGE_PART_USER_1 = 380;
const STRANGE_PART_USER_2 = 382;
const STRANGE_PART_USER_3 = 384;

// embedded strange parts

// imlicit_1 is kills from being strange it can be ignored since steam api does the same
// it's mostly kills or carnival kills
// which ends up being the same for the copies of the same item
// first implicit should be ignored
//const STRANGE_IMPLICIT_1 = 292;
//const STRANGE_IMPLICIT_2 = 293;
//const STRANGE_IMPLICIT_3 = 495;
// Elevate to strange if it has killEater
const KILLEATER = 214;
//TODO: Attributes are hard coded here it'll be better to parse them from the schema incase valve decides to add more spells :P
const SPELL_COLOR = 1004;
const SPELL_FOOTSTEP = 1005;

const VOICE_SPELL = 1006;
const PUMPKIN_SPELL = 1007;
const FIRE_SPELL = 1008;
const EXORCISM_SPELL = 1009;
export function fromAttributes(item: AttributeItemStripped, schema: Schema) {
  const sku: SkuType = {
    defindex: item.defindex,
    quality: item.quality,
    uncraftable: !!item.flag_cannot_craft,
    australium: false,
    festive: false,
    normalized: false,
    killstreak: 0
  };

  caseSku(sku, item.quality, item.attributes || [], schema);
  //fix paintKit strange items
  if (sku.paintKit && sku.quality === 11) {
    sku.quality = 15;
    sku.quality2 = 11;
  }
  if (sku.quality !== 11 && sku.quality2 !== 11) sku.strangeParts = undefined;
  return new Sku(sku);
}

function caseSku(sku: SkuType, quality: number, attribs: ItemAttribute[], schema: Schema) {
  for (const attrib of attribs) {
    switch (attrib.defindex) {
      case IS_AUSTRALIUM:
        sku.australium = true;
        continue;
      case IS_FESTIVIZED:
        sku.festive = true;
        continue;
      case KILLSTREAK_TIER:
        sku.killstreak = attrib.float_value!;
        continue;
      case TARGET_DEFINDEX:
        sku.target = attrib.float_value;
        continue;
      case CRAFT_NUMBER:
        if ((attrib.value as number) <= 100) sku.craftnumber = attrib.value as number;
        continue;
      case CRATE_SERIES:
        sku.crateseries = attrib.float_value;
        continue;
      case PARTICLE_EFFECT:
        sku.effect = attrib.float_value;
        continue;
      case TAUNT_PARTICLE_EFFECT:
        sku.effect = attrib.value as number;
        continue;
      case KILLSTREAKER:
        sku.killstreaker = attrib.float_value;
        continue;
      case SHEEN:
        sku.sheen = attrib.float_value;
        continue;
      case RGB_TINT_1:
        if (attrib.float_value !== 1 && sku.paint === undefined) sku.paint = attrib.float_value;
        continue;
      case ELEVATE_QUALITY:
        if (quality !== attrib.float_value && attrib.float_value === 11) sku.quality2 = attrib.float_value;
        continue;
      case TEXTURE_WEAR:
        sku.wear = Math.max(Math.round(attrib.float_value! * 5), 1);
        continue;
      case PAINT_KIT:
        sku.paintKit = attrib.value as number;
        continue;
      case KILLEATER:
        if (quality !== 11) sku.quality2 = 11;
        continue;
      case STRANGE_PART_USER_1:
      case STRANGE_PART_USER_2:
      case STRANGE_PART_USER_3:
        (sku.strangeParts ??= []).push(attrib.float_value!);
        continue;
      case SPELL_COLOR:
      case SPELL_FOOTSTEP:
        (sku.spells ??= []).push(schema.spells.getSpellLookup(attrib.defindex, attrib.float_value!)!);
        continue;
      case VOICE_SPELL:
      case PUMPKIN_SPELL:
      case FIRE_SPELL:
      case EXORCISM_SPELL:
        (sku.spells ??= []).push(attrib.defindex);
        continue;
      default:
        if (attrib.is_output && attrib.defindex >= 2000 && attrib.defindex <= 2009) {
          sku.output = attrib.itemdef;
          sku.outputQuality = attrib.quality;
          caseSku(sku, quality, attrib.attributes || [], schema);
        }
        continue;
    }
  }
}
