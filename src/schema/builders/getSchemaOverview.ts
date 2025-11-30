import got from './gotInstance';
import type { TwoWayMap } from '..';

export async function getSchemaOverview(isLiveUpdate: boolean = false, apiKey: string) {
  const res = await got.get(
    `https://api.steampowered.com/IEconItems_440/GetSchemaOverview/v0001?key=${apiKey}&language=English`,
    {
      context: { isLiveUpdate }
    }
  );
  const resp = (JSON.parse(res.body) as GetSchemaResponse).result;
  const qualities = new Map() as TwoWayMap;

  for (const key in resp.qualities) {
    const id = resp.qualities[key];
    const name = resp.qualityNames[key];
    qualities.set(id, name);
    qualities.set(name, id);
  }

  const effects = new Map() as TwoWayMap;

  //ADD invalid particle
  effects.set(0, 'Invalid Particle');
  effects.set('Invalid Particle', 0);
  for (const particle of resp.attribute_controlled_attached_particles) {
    effects.set(particle.id, particle.name);
    !effects.has(particle.name) && effects.set(particle.name, particle.id);
    // Lowercase version for steam
    const lowerCase = particle.name.toLowerCase();
    !effects.has(lowerCase) && effects.set(lowerCase, particle.id);
  }

  const origins = new Map() as TwoWayMap;

  for (const origin of resp.originNames) {
    origins.set(origin.origin, origin.name);
    origins.set(origin.name, origin.origin);
  }

  const attributes: { [defindex: number]: ResultAttribute } = {};

  for (const attribute of resp.attributes) {
    attributes[attribute.defindex] = attribute;
  }

  const itemSets: { [setName: string]: string[] } = {};
  for (const itemSet of resp.item_sets) {
    itemSets[itemSet.name] = itemSet.items;
  }

  const itemLevels: { [name: string]: Level[] } = {};
  for (const itemLevel of resp.item_levels) {
    itemLevels[itemLevel.name] = itemLevel.levels;
  }

  const parts = new Map() as TwoWayMap;
  for (const part of resp.kill_eater_score_types) {
    const name = part.type_name;
    parts.set(part.type, name);
    // reverse lookup fcfs
    //!parts.has(name) && parts.set(name, part.type);
  }

  const stringLookups: { [name: string]: StringLookupString[] } = {};
  for (const lookup of resp.string_lookups) {
    stringLookups[lookup.table_name] = lookup.strings;
  }

  return {
    qualities,
    effects,
    origins,
    attributes,
    itemSets,
    itemLevels,
    parts,
    stringLookups
  };
}

//
export interface GetSchemaResponse {
  result: Result;
}

export interface Result {
  status: number;
  items_game_url: string;
  qualities: { [key: string]: number };
  qualityNames: QualityNames;
  originNames: OriginName[];
  attributes: ResultAttribute[];
  item_sets: ItemSet[];
  attribute_controlled_attached_particles: AttributeControlledAttachedParticle[];
  item_levels: ItemLevel[];
  kill_eater_score_types: KillEaterScoreType[];
  string_lookups: StringLookup[];
}

export interface AttributeControlledAttachedParticle {
  system: string;
  id: number;
  attach_to_rootbone: boolean;
  name: string;
  attachment?: Attachment;
}

export enum Attachment {
  CigDrgSmoke = 'cig_drg_smoke',
  Halopoint1 = 'halopoint1',
  Muzzle = 'muzzle',
  Muzzle1 = 'muzzle1',
  Unusual = 'unusual',
  Unusual0 = 'unusual_0'
}

export interface ResultAttribute {
  name: string;
  defindex: number;
  attribute_class: null | string;
  description_string?: string;
  description_format?: DescriptionFormat;
  effect_type: EffectType;
  hidden: boolean;
  stored_as_integer: boolean;
}

export enum DescriptionFormat {
  ValueIsAccountID = 'value_is_account_id',
  ValueIsAdditive = 'value_is_additive',
  ValueIsAdditivePercentage = 'value_is_additive_percentage',
  ValueIsDate = 'value_is_date',
  ValueIsFromLookupTable = 'value_is_from_lookup_table',
  ValueIsInvertedPercentage = 'value_is_inverted_percentage',
  ValueIsItemDef = 'value_is_item_def',
  ValueIsKillstreakIdleeffectIndex = 'value_is_killstreak_idleeffect_index',
  ValueIsKillstreakeffectIndex = 'value_is_killstreakeffect_index',
  ValueIsOr = 'value_is_or',
  ValueIsParticleIndex = 'value_is_particle_index',
  ValueIsPercentage = 'value_is_percentage',
  VisualsMvmBoss = 'visuals_mvm_boss'
}

export enum EffectType {
  Negative = 'negative',
  Neutral = 'neutral',
  Positive = 'positive',
  Strange = 'strange',
  Unusual = 'unusual',
  ValueIsFromLookupTable = 'value_is_from_lookup_table'
}

export interface ItemLevel {
  name: string;
  levels: Level[];
}

export interface Level {
  level: number;
  required_score: number;
  name: string;
}

export interface ItemSet {
  item_set: string;
  name: string;
  items: string[];
  attributes?: ItemSetAttribute[];
  store_bundle?: string;
}

export interface ItemSetAttribute {
  name: string;
  class: string;
  value: number;
}

export interface KillEaterScoreType {
  type: number;
  type_name: string;
  level_data: string;
}

export interface OriginName {
  origin: number;
  name: string;
}

export interface QualityNames {
  Normal: string;
  rarity1: string;
  rarity2: string;
  vintage: string;
  rarity3: string;
  rarity4: string;
  Unique: string;
  community: string;
  developer: string;
  selfmade: string;
  customized: string;
  strange: string;
  completed: string;
  haunted: string;
  collectors: string;
  paintkitweapon: string;
}

export interface StringLookup {
  table_name: string;
  strings: StringLookupString[];
}

export interface StringLookupString {
  index: number;
  string: string;
}
