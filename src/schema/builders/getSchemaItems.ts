import got from 'got';
import { TwoWayMap } from '..';
import { SpellMap } from '../mapExtensions';
import fs from 'fs/promises';

export type GetSchemaItemsReturnType = Promise<{
  items: TwoWayMap;
  spells: SpellMap;
  cosmeticParts: TwoWayMap;
  parts: TwoWayMap;
  upgradables: Map<string, number>;
}>;

export async function getSchemaItems(apiKey: string): GetSchemaItemsReturnType {
  const items = new Map() as TwoWayMap;
  const upgradables = new Map<string, number>();
  const spells = new SpellMap();

  const parts = new Map() as TwoWayMap;
  const cosmeticParts = new Map() as TwoWayMap;
  let resp: Result | undefined;

  let useLocalCache = false;
  const localLastChange = parseInt(await fs.readFile('./tmp/lastChange.txt', 'utf8').catch(() => '0'));
  let remoteLastChange = 0;
  do {
    const l = await got.get(
      `https://api.steampowered.com/IEconItems_440/GetSchemaItems/v0001?key=${apiKey}&language=English&start=${
        resp?.next || 0
      }`,
      {
        //cache is broken for this endpoint
        //cache: FsCache.get(),
        retry: {
          limit: 5,
          // It is possible to get 404 from this endpoint claiming that it is retired
          statusCodes: [404, 408, 413, 429, 500, 502, 503, 504, 521, 522, 524]
        }
      }
    );
    // Check only on the first request
    if (!resp) {
      const lastModified = l.headers['last-modified'];
      if (lastModified !== undefined) {
        const date = new Date(lastModified).getTime();
        // Successful file access returns undefined
        const fileAccess = await fs.access('./tmp/schemaItems.json', fs.constants.R_OK).catch(() => false);

        if (date === localLastChange && fileAccess !== false) {
          // read from cache
          useLocalCache = true;
          break;
        }
        remoteLastChange = date;
      }
    }
    resp = (JSON.parse(l.body) as GetSchemaItemsResponse).result;

    for (const item of resp.items) {
      const name: string =
        item.item_name === 'Kit'
          ? item.item_type_name
          : item.defindex === 20002
          ? 'Specialized Killstreak Kit Fabricator'
          : item.defindex === 20003
          ? 'Professional Killstreak Kit Fabricator'
          : item.item_name;

      items.set(item.defindex, name);
      !items.has(name) && items.set(name, item.defindex);

      // Upgradable items
      if (item.name.startsWith('Upgradeable ')) {
        upgradables.set(item.item_name, item.defindex);
      }

      // strange parts
      if (item.item_type_name === 'Strange Part') {
        const counterID = getCounterID(item.attributes);
        if (counterID === undefined) continue;
        const itemName = name.substring(name.indexOf(':') + 2);
        const itemBaseName = item.name.substring(item.name.indexOf(':') + 2);
        const map = name.startsWith('Strange Cosmetic Part: ') ? cosmeticParts : parts;

        map.set(counterID, itemName);
        !map.has(itemName) && map.set(itemName, counterID);
        !map.has(itemBaseName) && map.set(itemBaseName, counterID);
        continue;
      }
      // spells
      if (!name.startsWith('Halloween Spell: ')) continue;

      const descStr = name.substring(17);
      spells.setSpell(descStr, item.defindex);
    }
    await new Promise(resolve => setTimeout(resolve, 200));
  } while (resp.next !== undefined);

  if (useLocalCache) {
    return JSON.parse(await fs.readFile('./tmp/schemaItems.json', 'utf8'), JsonMapReviver);
  }
  const data = { items, spells, cosmeticParts, parts, upgradables };

  await Promise.all([
    fs.writeFile('./tmp/schemaItems.json', JSON.stringify(data, JsonMapReplacer)),
    fs.writeFile('./tmp/lastChange.txt', remoteLastChange.toString())
  ]);

  return { items, spells, cosmeticParts, parts, upgradables };
}

function JsonMapReplacer(_key: string, value: any) {
  if (value instanceof Map) {
    return { __map__: Array.from(value.entries()) };
  }
  return value;
}
function JsonMapReviver(_key: string, value: any) {
  if (value && value.__map__) {
    return new Map(value.__map__);
  }
  return value;
}
function getCounterID(attribs: Attribute[] | undefined) {
  return attribs?.find(attrib => attrib.class === 'strange_part_new_counter_id')?.value;
}
export interface GetSchemaItemsResponse {
  result: Result;
}

export interface Result {
  status: number;
  items_game_url: string;
  items: Item[];
  next: number;
}

export interface Item {
  name: string;
  defindex: number;
  item_class: string;
  item_type_name: string;
  item_name: string;
  proper_name: boolean;
  item_slot?: ItemSlot;
  model_player: null | string;
  item_quality: number;
  image_inventory: string;
  min_ilevel: number;
  max_ilevel: number;
  image_url: null | string;
  image_url_large: null | string;
  craft_class?: Craft;
  craft_material_type?: Craft;
  capabilities: { [key: string]: boolean };
  used_by_classes?: UsedByClass[];
  item_description?: string;
  styles?: Style[];
  attributes?: Attribute[];
  drop_type?: DropType;
  item_set?: string;
  holiday_restriction?: HolidayRestriction;
  per_class_loadout_slots?: PerClassLoadoutSlots;
  tool?: Tool;
}

export interface Attribute {
  name: string;
  class: string;
  value: number;
}

export enum Craft {
  CraftBar = 'craft_bar',
  Empty = '',
  Hat = 'hat',
  HauntedHat = 'haunted_hat',
  Weapon = 'weapon'
}

export enum DropType {
  Drop = 'drop',
  None = 'none'
}

export enum HolidayRestriction {
  Birthday = 'birthday',
  Christmas = 'christmas',
  HalloweenOrFullmoon = 'halloween_or_fullmoon'
}

export enum ItemSlot {
  Action = 'action',
  Building = 'building',
  Melee = 'melee',
  Misc = 'misc',
  PDA = 'pda',
  Pda2 = 'pda2',
  Primary = 'primary',
  Secondary = 'secondary',
  Taunt = 'taunt'
}

export interface PerClassLoadoutSlots {
  Soldier: ItemSlot;
  Heavy?: ItemSlot;
  Pyro?: ItemSlot;
  Engineer?: ItemSlot;
  Demoman?: ItemSlot;
}

export interface Style {
  name: string;
  additional_hidden_bodygroups?: AdditionalHiddenBodygroups;
}

export interface AdditionalHiddenBodygroups {
  hat?: number;
  headphones?: number;
  head?: number;
}

export interface Tool {
  type: Type;
}

export enum Type {
  DuelMinigame = 'duel_minigame',
  Gift = 'gift',
  NoiseMaker = 'noise_maker',
  PowerupBottle = 'powerup_bottle'
}

export enum UsedByClass {
  Demoman = 'Demoman',
  Engineer = 'Engineer',
  Heavy = 'Heavy',
  Medic = 'Medic',
  Pyro = 'Pyro',
  Scout = 'Scout',
  Sniper = 'Sniper',
  Soldier = 'Soldier',
  Spy = 'Spy'
}
