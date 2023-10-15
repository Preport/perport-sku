import { Schema } from '../schema/schema';
import { Sku, SkuType } from '../skuObject';
import { AttributeItemStripped } from './attributes';

const PARTICLE_EFFECT = 134;
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

const STRANGE_PART_USER_1 = 380;
const STRANGE_PART_2 = 293;
const STRANGE_PART_USER_2 = 382; //< bu var
const STRANGE_PART_3 = 495;
const STRANGE_PART_USER_3 = 384; //< bu var

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

  for (const attrib of item.attributes || []) {
    switch (attrib.defindex) {
      case IS_AUSTRALIUM:
        sku.australium = true;
        continue;
      case IS_FESTIVIZED:
        sku.festive = true;
        continue;
      case KILLSTREAK_TIER:
        sku.killstreak = attrib.float_value || 0;
        continue;
      case TARGET_DEFINDEX:
        sku.target = attrib.float_value;
        continue;
      case CRAFT_NUMBER:
        sku.craftnumber = attrib.value as number;
        continue;
      case CRATE_SERIES:
        sku.craftnumber = attrib.float_value;
        continue;
      case PARTICLE_EFFECT:
        sku.effect = attrib.float_value;
        continue;
      case KILLSTREAKER:
        sku.killstreaker = attrib.float_value;
        continue;
      case SHEEN:
        sku.sheen = attrib.float_value;
        continue;
      case RGB_TINT_1:
        if (attrib.float_value !== 1) sku.paint = attrib.float_value;
        continue;
      case ELEVATE_QUALITY:
        if (item.quality !== attrib.float_value && attrib.float_value === 11) sku.quality2 = attrib.float_value;
        continue;
      case TEXTURE_WEAR:
        sku.wear = Math.floor(attrib.float_value! * 5);
        continue;
      case PAINT_KIT:
        sku.paintKit = attrib.value as number;
        continue;
      case STRANGE_PART_USER_1:
      case STRANGE_PART_USER_2:
      case STRANGE_PART_USER_3:
      case STRANGE_PART_2:
      case STRANGE_PART_3:
        (sku.strangeParts ??= []).push(attrib.float_value!);
        continue;
      case SPELL_COLOR:
      case SPELL_FOOTSTEP:
        (sku.spells ??= []).push(+schema.spells![`${attrib.defindex}-${attrib.float_value!}`]);
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
        }
        continue;
    }
  }
  return new Sku(sku);
}
