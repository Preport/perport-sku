import { getTfEnglish } from './builders/getTfEnglish';
import { getSchemaItems } from './builders/getSchemaItems';
import { MinifiedAttributes, UsageAttributes, getItemsGame } from './builders/getItemsGame';
import { getPaintKits } from './builders/getPaintKits';
import { getSchemaOverview } from './builders/getSchemaOverview';
import { SpellMap } from './mapExtensions';

export interface TwoWayMap extends Map<string | number, string | number> {
  get(key: string): number | undefined;
  get(key: number): string | undefined;

  set(key: string, value: number): this;
  set(key: number, value: string): this;
}

//TODO: Create a map to normalize parts that have the same name ie 97,87,0
export class Schema {
  readonly readyProm: Promise<any>;
  readonly #apiKey: string;

  killstreakers: TwoWayMap = new Map();
  sheens: TwoWayMap = new Map();
  effects: TwoWayMap = new Map();
  paintKits: TwoWayMap = new Map();
  rarities: TwoWayMap = new Map();
  origins: TwoWayMap = new Map();
  qualities: TwoWayMap = new Map();

  spells: SpellMap = new SpellMap();
  cosmeticParts: TwoWayMap = new Map();
  parts: TwoWayMap = new Map();
  itemNames: TwoWayMap = new Map();

  upgradables: Map<string, number> = new Map();
  items: Record<number, MinifiedAttributes> = {};
  readonly defindexMap = new Map<number, number>();
  readonly normalizedStrangePartMap = new Map<number, number>();
  constructor(apiKey: string) {
    this.#apiKey = apiKey;
    this.readyProm = this.getSchema();
  }

  private async getSchema() {
    const [schemaItems, tfEnglish, itemsGame, paintKits, schemaOverview] = await Promise.all([
      getSchemaItems(this.#apiKey),
      getTfEnglish(),
      getItemsGame(),
      getPaintKits(),
      getSchemaOverview(this.#apiKey)
    ]);

    //spell attrib defindexes from overview
    Object.entries(schemaOverview.attributes).forEach(([defindex, attrib]) => {
      if (attrib.name?.startsWith('SPELL: ')) {
        const descStr = attrib.name.startsWith('SPELL: Halloween') ? attrib.description_string! : attrib.name;
        schemaItems.spells.setSpell(descStr, +defindex);
      }
    });
    //extend spells
    Object.entries(itemsGame.attribs).forEach(([defindex, attrib]) => {
      if (attrib.name?.startsWith('Halloween Spell: ')) {
        const spellName = attrib.name.slice(17);
        schemaItems.spells.setSpell(spellName, +defindex);
        const usageAttribs = attrib.tool?.usage?.attributes as UsageAttributes;
        if (!usageAttribs) return;
        schemaItems.spells.setSpellLookup(+defindex, usageAttribs);
      }
    });

    //schemaItems
    this.itemNames = schemaItems.items;
    this.parts = schemaItems.parts;
    this.cosmeticParts = schemaItems.cosmeticParts;
    this.upgradables = schemaItems.upgradables;
    //tfEnglish
    this.killstreakers = tfEnglish.killstreakers;
    this.sheens = tfEnglish.sheens;
    //itemsGame
    this.items = itemsGame.attribs;
    //paintKits from proto_obj_defs_english.txt
    this.paintKits = paintKits;
    //schemaOverview
    this.effects = schemaOverview.effects;
    this.qualities = schemaOverview.qualities;
    this.spells = schemaItems.spells;

    /*
    const [fetchall, tfEng] = await Promise.all([fetchAll(this.#apiKey) as FetchAllType, getTfEnglish()]);
    this.killstreakers = tfEng.killstreakers;
    this.sheens = tfEng.sheens;

    (Object.keys(fetchall) as (keyof FetchAllType)[]).forEach(key => {
      if (key === 'attributes' || key === 'sets' || key === 'levels' || key === 'lookups' || key === 'items') return;
      this[key] = fetchall[key];
    });

    for (const key in fetchall.attributes) {
      const attrib = fetchall.attributes[key];
      if (attrib.name?.startsWith('SPELL: ')) {
        const descStr = attrib.name.startsWith('SPELL: Halloween') ? attrib.description_string : attrib.name;
        this.spells[descStr] = +key;
        this.spells[key] = descStr;
      }
    }

    if (this.itemNames) {
      for (const id in this.itemNames) {
        let name = this.itemNames![id];
        if (this.itemNames![name]) {
          this.defindexMap.set(+id, +this.itemNames![name]);
        } else this.itemNames![name] = id;

        if (typeof name === 'string' && name.startsWith('Halloween Spell: ')) {
          const str = name.slice(17);
          this.spells[str] ??= +id;
          this.spells[id] ??= str;
          const attribs = this.itemsGame.items[id].tool.usage.attributes;

          if (!attribs) continue;
          const firstAttribKey = Object.keys(attribs)[0];
          const float_val = attribs[firstAttribKey];

          const attribBase = this.spells[firstAttribKey];
          if (attribBase === undefined) continue;
          const spellFullDefindex = `${attribBase}-${float_val}`;
          this.spells[spellFullDefindex] = id;
          this.spells[`reverse-${id}`] = spellFullDefindex;
        }
      }
    }
    */
    for (const [id, name] of schemaOverview.parts.entries() as IterableIterator<[number, string]>) {
      this.parts.has(id) && this.parts.set(name, id);
    }

    const seen: { [partName: string]: number } = {};
    let first: number;
    for (const [key, value] of this.parts) {
      if (typeof key === 'string') continue;

      if ((first = seen[value]) !== undefined) {
        this.normalizedStrangePartMap.set(key, first);
      } else seen[value] = key;
    }

    //console.log(this.spells);
  }
}

export type FetchAllType = {
  itemsGame: any;
  paintKits: any;

  qualities: any;
  effects: any;
  origins: any;
  attributes: {
    [id: string]: any;
  };
  sets: any;
  levels: any;
  parts: any;
  lookups: any;

  itemNames: any;
  items: any;
};
