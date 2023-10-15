import got from 'got';
import Keyv from 'keyv';
import { TwoWayMap } from '../schema';

export async function getSchemaItems(apiKey: string) {
  const items = new Map() as TwoWayMap;
  let resp: Result | undefined;
  do {
    resp = (
      (await got
        .get(
          `https://api.steampowered.com/IEconItems_440/GetSchemaItems/v0001?key=${apiKey}&language=English&start=${
            resp?.next || 0
          }`,
          {
            cache: new Keyv('offline://./tmp/caches')
          }
        )
        .json()) as GetSchemaItemsResponse
    ).result;
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
    }
  } while (resp.next !== undefined);

  return items;
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
