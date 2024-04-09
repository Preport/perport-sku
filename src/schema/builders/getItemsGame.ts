import got from './gotInstance';
import vdf from 'vdf-parser';

export async function getItemsGame(isLiveUpdate: boolean = false) {
  const resp = await got.get(
    'https://raw.githubusercontent.com/SteamDatabase/GameTracking-TF2/master/tf/scripts/items/items_game.txt',
    {
      context: {
        isLiveUpdate
      }
    }
  );

  // we only care about static_attrs, attributes and tool

  //const staticAttrRegex = /"(\d+)"\s+{.*"static_attrs"\s+{([\s\S]+?)}/g;

  //"(\d+)"\s+{[\s\S]+?(?:"static_attrs"\s+{(\s+"(.+)"\s+"(.+)")+\s+})?[\s\S]+?\n\t\t}

  const unMinified = vdf.parse(resp.body) as Record<string, any>;
  const items: Record<number, MinifiedAttributes> = {};

  //parse spell attrs
  Object.entries(unMinified.items_game.items).forEach(([key, value]) => {
    const attrib = value as any;

    items[key] = {
      name: attrib.name,
      armory_desc: attrib.armory_desc,
      item_class: attrib.item_class,
      static_attrs: attrib.static_attrs,
      attributes: attrib.attributes,
      prefab: attrib.prefab,
      tool: attrib.tool
    };
  });
  return { attribs: items };
}

export interface MinifiedAttributes {
  name: string;
  static_attrs?: StaticAttr[] | StaticAttrsClass;
  item_class?: string;
  armory_desc?: string;
  prefab?: string;
  attributes?: Attribute[] | AttributesAttributes;
  tool?: Tool;
}

export interface Attribute {
  'taunt is press and hold'?: InnerAttribute;
  'taunt move speed'?: InnerAttribute;
  'taunt move acceleration time'?: InnerAttribute;
  'taunt turn speed'?: InnerAttribute;
  'taunt turn acceleration time'?: InnerAttribute;
  'taunt force move forward'?: InnerAttribute;
  'taunt success sound loop'?: AdditionalHalloweenResponseCriteriaName;
  'taunt force weapon slot'?: AdditionalHalloweenResponseCriteriaName;
}

export interface InnerAttribute {
  attribute_class: string;
  value: number;
}

export interface AdditionalHalloweenResponseCriteriaName {
  attribute_class: string;
  value: string;
}

export interface AttributesAttributes {
  'kill eater score type'?: InnerAttribute;
  'kill eater score type 2'?: InnerAttribute;
  'kill eater score type 3'?: InnerAttribute;
  'heal on hit for rapidfire'?: InnerAttribute;
  'health drain medic'?: InnerAttribute;
  'slow enemy on hit'?: InnerAttribute;
  'damage penalty'?: InnerAttribute;
  'minigun spinup time increased'?: InnerAttribute;
  'lunchbox adds minicrits'?: InnerAttribute;
  spunup_damage_resistance?: InnerAttribute;
  'critboost on kill'?: InnerAttribute;
  'fire rate penalty'?: InnerAttribute;
  'mod bat launches balls'?: InnerAttribute;
  'max health additive penalty'?: InnerAttribute;
  'special taunt'?: InnerAttribute;
  'backstab shield'?: InnerAttribute;
  'allowed in medieval mode'?: InnerAttribute;
  'patient overheal penalty'?: InnerAttribute;
  'set cloak is feign death'?: InnerAttribute;
  'cloak consume rate decreased'?: InnerAttribute;
  cloak_consume_on_feign_death_activate?: InnerAttribute;
  'mult cloak meter regen rate'?: InnerAttribute;
  mod_cloak_no_regen_from_items?: InnerAttribute;
  'set cloak is movement based'?: InnerAttribute;
  NoCloakWhenCloaked?: InnerAttribute;
  ReducedCloakFromAmmo?: InnerAttribute;
  'cannot trade'?: InnerAttribute;
  'always tradable'?: InnerAttribute;
  'halloween item'?: InnerAttribute;
  'attach particle effect static'?: InnerAttribute;
  'Blast radius decreased'?: InnerAttribute;
  'Projectile speed increased'?: InnerAttribute;
  'damage bonus'?: InnerAttribute;
  'mod mini-crit airborne'?: InnerAttribute;
  'disable fancy class select anim'?: InnerAttribute;
  'provide on active'?: InnerAttribute;
  'mod shovel damage boost'?: InnerAttribute;
  reduced_healing_from_medics?: InnerAttribute;
  'fire rate bonus'?: InnerAttribute;
  'sticky detonate mode'?: InnerAttribute;
  'stickies detonate stickies'?: InnerAttribute;
  'maxammo secondary increased'?: InnerAttribute;
  'max pipebombs increased'?: InnerAttribute;
  'sticky arm time penalty'?: InnerAttribute;
  'rocket jump damage reduction'?: InnerAttribute;
  'gunslinger punch combo'?: InnerAttribute;
  'mod wrench builds minisentry'?: InnerAttribute;
  'max health additive bonus'?: InnerAttribute;
  'engineer sentry build rate multiplier'?: InnerAttribute;
  'crit mod disabled'?: InnerAttribute;
  'counts as assister is some kind of pet this update is going to be awesome'?: InnerAttribute;
  'dmg bonus vs buildings'?: InnerAttribute;
  'dmg penalty vs players'?: InnerAttribute;
  'damage applies to sappers'?: InnerAttribute;
  'increase player capture value'?: InnerAttribute;
  'dmg taken from bullets increased'?: InnerAttribute;
  'bleeding duration'?: InnerAttribute;
  'dmg taken from fire increased'?: InnerAttribute;
  'lunchbox adds maxhealth bonus'?: InnerAttribute;
  mod_mark_attacker_for_death?: InnerAttribute;
  'taunt is press and hold'?: InnerAttribute;
  'taunt attack name'?: AdditionalHalloweenResponseCriteriaName;
  'taunt attack time'?: InnerAttribute;
  'turn to gold'?: InnerAttribute;
  ubercharge_preserved_on_spawn_max?: InnerAttribute;
  'add cloak on hit'?: InnerAttribute;
  'mod soldier buff type'?: InnerAttribute;
  'sniper no headshots'?: InnerAttribute;
  'jarate duration'?: InnerAttribute;
  'sniper charge per sec'?: InnerAttribute;
  'afterburn immunity'?: InnerAttribute;
  'dmg taken from fire reduced'?: InnerAttribute;
  'dmg taken increased'?: InnerAttribute;
  'minicrits become crits'?: InnerAttribute;
  'no self blast dmg'?: InnerAttribute;
  'maxammo primary increased'?: InnerAttribute;
  'cannot pick up intelligence'?: InnerAttribute;
  'override projectile type'?: InnerAttribute;
  'max pipebombs decreased'?: InnerAttribute;
  'noise maker'?: InnerAttribute;
  'single wep deploy time increased'?: InnerAttribute;
  'heal on kill'?: InnerAttribute;
  'energy buff dmg taken multiplier'?: InnerAttribute;
  'drop health pack on kill'?: InnerAttribute;
  'dmg taken from blast increased'?: InnerAttribute;
  'hit self on miss'?: InnerAttribute;
  'dmg from ranged reduced'?: InnerAttribute;
  'dmg from melee increased'?: InnerAttribute;
  'single wep holster time increased'?: InnerAttribute;
  'Set DamageType Ignite'?: InnerAttribute;
  'crit vs burning players'?: InnerAttribute;
  'dmg taken from fire reduced on active'?: InnerAttribute;
  'health regen'?: InnerAttribute;
  'mark for death'?: InnerAttribute;
  sanguisuge?: InnerAttribute;
  is_a_sword?: InnerAttribute;
  'decapitate type'?: InnerAttribute;
  'restore health on kill'?: InnerAttribute;
  honorbound?: InnerAttribute;
  'charge recharge rate increased'?: InnerAttribute;
  'charge impact damage increased'?: InnerAttribute;
  'dmg taken from blast reduced'?: InnerAttribute;
  'heal rate bonus'?: InnerAttribute;
  'medigun charge is megaheal'?: InnerAttribute;
  'ubercharge rate bonus'?: InnerAttribute;
  'overheal penalty'?: InnerAttribute;
  'move speed bonus resource level'?: InnerAttribute;
  'mod see enemy health'?: InnerAttribute;
  'clip size bonus'?: InnerAttribute;
  'mod crit while airborne'?: InnerAttribute;
  speed_boost_on_hit?: InnerAttribute;
  'energy weapon no ammo'?: InnerAttribute;
  'energy weapon penetration'?: InnerAttribute;
  'energy weapon no hurt building'?: InnerAttribute;
  'energy weapon no deflect'?: InnerAttribute;
  'damage force reduction'?: InnerAttribute;
  'airblast vulnerability multiplier'?: InnerAttribute;
  'boots falling stomp'?: InnerAttribute;
  'kill eater kill type'?: InnerAttribute;
  mod_air_control_blast_jump?: InnerAttribute;
  'air dash count'?: InnerAttribute;
  'dmg pierces resists absorbs'?: InnerAttribute;
  'damage bonus while disguised'?: InnerAttribute;
  'add cloak on kill'?: InnerAttribute;
  speed_boost_on_kill?: InnerAttribute;
  'taunt force weapon slot'?: AdditionalHalloweenResponseCriteriaName;
  'centerfire projectile'?: InnerAttribute;
  'has pipboy build interface'?: InnerAttribute;
  'sapper kills collect crits'?: InnerAttribute;
  'damage bonus bullet vs sentry target'?: InnerAttribute;
  'mod ammo per shot'?: InnerAttribute;
  'mod use metal ammo type'?: InnerAttribute;
  'mod no reload DISPLAY ONLY'?: InnerAttribute;
  'mod max primary clip override'?: InnerAttribute;
  'add onhit addammo'?: InnerAttribute;
  'electrical airblast DISPLAY ONLY'?: InnerAttribute;
  'disable weapon hiding for animations'?: InnerAttribute;
  'unlimited quantity'?: InnerAttribute;
  'override footstep sound set'?: InnerAttribute;
  'spawn with physics toy'?: InnerAttribute;
  'fish damage override'?: InnerAttribute;
  'bombinomicon effect on death'?: InnerAttribute;
  'crit kill will gib'?: InnerAttribute;
  'subtract victim medigun charge on hit'?: InnerAttribute;
  'subtract victim cloak on hit'?: InnerAttribute;
  'alt fire teleport to spawn'?: InnerAttribute;
  'Construction rate decreased'?: InnerAttribute;
  metal_pickup_decreased?: InnerAttribute;
  'mod teleporter cost'?: InnerAttribute;
  'damage all connected'?: InnerAttribute;
  'ragdolls become ash'?: InnerAttribute;
  'burn damage earns rage'?: InnerAttribute;
  'airblast disabled'?: InnerAttribute;
  'extinguish earns revenge crits'?: InnerAttribute;
  'extinguish restores health'?: InnerAttribute;
  'aiming knockback resistance'?: InnerAttribute;
  'aiming no flinch'?: InnerAttribute;
  'mod bat launches ornaments'?: InnerAttribute;
  'effect bar recharge rate increased'?: InnerAttribute;
  'freeze backstab victim'?: InnerAttribute;
  'melts in fire'?: InnerAttribute;
  'become fireproof on hit by fire'?: InnerAttribute;
  'set icicle knife mode'?: InnerAttribute;
  'add jingle to footsteps'?: InnerAttribute;
  'crit forces victim to laugh'?: InnerAttribute;
  'crit from behind'?: InnerAttribute;
  'crit does no damage'?: InnerAttribute;
  'tickle enemies wielding same weapon'?: InnerAttribute;
  'cosmetic taunt sound'?: AdditionalHalloweenResponseCriteriaName;
  'fire rate bonus HIDDEN'?: InnerAttribute;
  'auto fires full clip'?: InnerAttribute;
  'can overload'?: InnerAttribute;
  'reload time increased hidden'?: InnerAttribute;
  'clip size penalty HIDDEN'?: InnerAttribute;
  'projectile spread angle penalty'?: InnerAttribute;
  'no primary ammo from dispensers while active'?: InnerAttribute;
  'blast radius decreased'?: InnerAttribute;
  'vision opt in flags'?: InnerAttribute;
  'pyrovision only DISPLAY ONLY'?: InnerAttribute;
  'pyrovision opt in DISPLAY ONLY'?: InnerAttribute;
  'clip size penalty'?: InnerAttribute;
  minicrit_boost_charge_rate?: InnerAttribute;
  minicrit_boost_when_charged?: InnerAttribute;
  'damage penalty on bodyshot'?: InnerAttribute;
  'rage on kill'?: InnerAttribute;
  'rage on assists'?: InnerAttribute;
  'sniper rage DISPLAY ONLY'?: InnerAttribute;
  'move speed penalty'?: InnerAttribute;
  'boost on damage'?: InnerAttribute;
  'hype resets on jump'?: InnerAttribute;
  'lose hype on take damage'?: InnerAttribute;
  'mod shovel speed boost'?: InnerAttribute;
  'self mark for death'?: InnerAttribute;
  'sapper voice pak'?: InnerAttribute;
  'sapper voice pak idle wait'?: InnerAttribute;
  'ubercharge overheal rate penalty'?: InnerAttribute;
  'overheal fill rate reduced'?: InnerAttribute;
  'medigun charge is resists'?: InnerAttribute;
  'medigun bullet resist passive'?: InnerAttribute;
  'medigun bullet resist deployed'?: InnerAttribute;
  'medigun blast resist passive'?: InnerAttribute;
  'medigun blast resist deployed'?: InnerAttribute;
  'medigun fire resist passive'?: InnerAttribute;
  'medigun fire resist deployed'?: InnerAttribute;
  'is marketable'?: InnerAttribute;
  'crit on hard hit'?: InnerAttribute;
  'sniper no headshot without full charge'?: InnerAttribute;
  'sniper crit no scope'?: InnerAttribute;
  'sniper fires tracer HIDDEN'?: InnerAttribute;
  'lose demo charge on damage when charging'?: InnerAttribute;
  'full charge turn control'?: InnerAttribute;
  'kill refills meter'?: InnerAttribute;
  'breadgloves properties'?: InnerAttribute;
  'parachute attribute'?: InnerAttribute;
  'closerange backattack minicrits'?: InnerAttribute;
  'spread penalty'?: InnerAttribute;
  'taunt success sound loop'?: AdditionalHalloweenResponseCriteriaName;
  'taunt success sound loop offset'?: InnerAttribute;
  'taunt force move forward'?: InnerAttribute;
  'taunt move speed'?: InnerAttribute;
  'taunt turn speed'?: InnerAttribute;
  'taunt mimic'?: InnerAttribute;
  'display duck leaderboard'?: InnerAttribute;
  'decoded by itemdefindex'?: InnerAttribute;
  'unlimited quantity hidden'?: InnerAttribute;
  'duckstreaks active'?: InnerAttribute;
  'sticky arm time bonus'?: InnerAttribute;
  'stickybomb charge rate'?: InnerAttribute;
  stickybomb_charge_damage_increase?: InnerAttribute;
  'custom projectile model'?: AdditionalHalloweenResponseCriteriaName;
  'single wep deploy time decreased'?: InnerAttribute;
  'switch from wep deploy time decreased'?: InnerAttribute;
  'force weapon switch'?: InnerAttribute;
  'taunt turn acceleration time'?: InnerAttribute;
  'taunt move acceleration time'?: InnerAttribute;
  'taunt success sound'?: AdditionalHalloweenResponseCriteriaName;
  'never craftable'?: InnerAttribute;
  'move speed bonus'?: InnerAttribute;
  'lunchbox healing decreased'?: InnerAttribute;
  'attach particle effect'?: InnerAttribute;
  'elevate quality'?: InnerAttribute;
  'set item tint RGB'?: InnerAttribute;
  'set item tint RGB 2'?: InnerAttribute;
  'set supply crate series'?: InnerAttribute;
  'tool target item'?: InnerAttribute;
  'strange part new counter ID'?: InnerAttribute;
  'killstreak tier'?: InnerAttribute;
  'spellbook page attr id'?: InnerAttribute;
  'series number'?: InnerAttribute;
  'recipe no partial complete'?: InnerAttribute;
  always_transmit_so?: InnerAttribute;
  'additional halloween response criteria name'?: AdditionalHalloweenResponseCriteriaName;
}

export interface StaticAttr {
  min_viewmodel_offset?: string;
  'limited quantity item'?: number;
}

export interface StaticAttrsClass {
  min_viewmodel_offset?: string;
  'limited quantity item'?: number;
  item_meter_charge_type?: number;
  item_meter_charge_rate?: number;
  meter_label?: string;
  mult_patient_overheal_penalty_active?: number;
  mult_health_fromhealers_penalty_active?: number;
  mult_player_movespeed_active?: number;
  mod_maxhealth_drain_rate?: number;
  'energy weapon no ammo'?: number;
  'energy weapon charged shot'?: number;
  'energy weapon no hurt building'?: number;
  crits_become_minicrits?: number;
  'crit mod disabled'?: number;
  inspect_viewmodel_offset?: string;
  'is marketable'?: number;
  'is commodity'?: number;
  tag__summer2014?: number;
  'cannot trade'?: number;
  'cannot delete'?: number;
  'hidden primary max ammo bonus'?: number;
  'airblast cost scale hidden'?: number;
  'dragons fury neutral properties'?: number;
  'dragons fury positive properties'?: number;
  'dragons fury negative properties'?: number;
  'extinguish restores health'?: number;
  'damage force increase hidden'?: number;
  'taunt attack name'?: string;
  'taunt attack time'?: number;
  holster_anim_time?: number;
  falling_impact_radius_pushback?: number;
  thermal_thruster?: number;
  item_meter_damage_for_full_charge?: number;
  item_meter_resupply_denied?: number;
  grenades1_resupply_denied?: number;
  item_meter_starts_empty_DISPLAY_ONLY?: number;
  item_meter_charge_type_3_DISPLAY_ONLY?: number;
  'damage penalty'?: number;
  speed_boost_on_hit_enemy?: number;
  cosmetic_allow_inspect?: number;
  'always tradable'?: number;
  'cannot restore'?: number;
  'cannot giftwrap'?: number;
  'tool needs giftwrap'?: number;
  'random drop line item unusual chance'?: number;
  'random drop line item unusual list'?: string;
  'random drop line item footer desc'?: string;
  'decoded by itemdefindex'?: number;
  'can shuffle crate contents'?: number;
  'loot list name'?: string;
  'tool target item'?: number;
  'shuffle crate item def min'?: number;
  'shuffle crate item def max'?: number;
  'set supply crate series'?: number;
  'hide crate series number'?: number;
  weapon_allow_inspect?: number;
  'kill eater score type'?: number;
  'kill eater score type 2'?: number;
  'kill eater score type 3'?: number;
  'kill eater user score type 1'?: number;
  'never craftable'?: number;
  is_operation_pass?: number;
  'style changes on strange level'?: number;
  always_transmit_so?: number;
  'deactive date'?: number;
  'kill eater user score type 2'?: number;
  allow_halloween_offering?: number;
  'item style override'?: number;
  'is winter case'?: number;
  unusualifier_attribute_template_name?: string;
  paintkit_proto_def_index?: number;
  'has team color paintkit'?: number;
  'item name text override'?: string;
  'ragdolls become ash'?: number;
  'ragdolls plasma effect'?: number;
  'is giger counter'?: number;
}

export interface Tool {
  type?: string;
  usage?: Usage;
  usage_capabilities?: UsageCapabilities;
  use_string?: string;
  restriction?: string;
}

export interface Usage {
  loot_list?: string;
  num_items?: number;
  max_recipients?: number;
  target_rule?: TargetRule;
  wrapped_gift_item_def?: string;
  backpack_slots?: number;
  target_type_global?: number;
  delivered_gift_item_def?: string;
  operation_pass?: string;
  bonus_lootlist?: string;
  required_tags?: { [key: string]: number };
  itemrarity_restrictions?: number;
  required_missing_tags?: RequiredMissingTags;
  attributes?: UsageAttributes;
  components?: Components;
}

export interface UsageAttributes {
  'SPELL: set item tint RGB'?: number;
  'SPELL: set Halloween footstep type'?: number;
  'SPELL: Halloween death ghosts'?: number;
  'SPELL: Halloween pumpkin explosions'?: number;
  'SPELL: Halloween green flames'?: number;
}

export interface Components {
  input: { [key: string]: Input };
}

export interface Input {
  lootlist_name?: LootlistName;
  quality: Quality;
  counts?: { [key: string]: number };
  item_name?: string;
  no_item_def?: number;
}

export enum LootlistName {
  AllStrangeWeaponsNoFestives = 'all_strange_weapons__no_festives',
  TimedRewardDrop = 'timed_reward_drop'
}

export enum Quality {
  Strange = 'strange',
  Unique = 'unique'
}

export interface RequiredMissingTags {
  cannot_damage_buildings?: number;
  prevents_uber?: number;
  cannot_damage_tanks?: number;
}

export enum TargetRule {
  OnlySelf = 'only_self'
}

export interface UsageCapabilities {
  decodable?: number;
  paintable?: number;
  can_customize_texture?: number;
  can_gift_wrap?: number;
  nameable?: number;
  duck_upgradable?: number;
  can_killstreakify?: number;
}
