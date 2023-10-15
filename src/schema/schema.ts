import { fetchAll } from 'tf2-static-schema/core';
import type { KillstreakerSheenType, getTfEnglish } from './builders/getTfEnglish';

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

  killstreakers?: KillstreakerSheenType;
  sheens?: KillstreakerSheenType;
  effects?: KillstreakerSheenType;
  paintKits?: KillstreakerSheenType;
  rarities?: KillstreakerSheenType;
  origins?: KillstreakerSheenType;
  qualities?: KillstreakerSheenType;

  spells: KillstreakerSheenType = {};
  parts?: Parts;
  itemNames?: KillstreakerSheenType;

  itemsGame?: any;
  readonly defindexMap = new Map<number, number>();
  readonly normalizedStrangePartMap = new Map<number, number>();
  constructor(apiKey: string) {
    this.#apiKey = apiKey;
    this.readyProm = this.getSchema();
  }

  private async getSchema() {
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

    if (this.parts) {
      const seen: { [partName: string]: number } = {};
      let first: number;
      for (const id in this.parts) {
        const name = this.parts[id].type_name;
        if ((first = seen[name]) !== undefined) {
          this.normalizedStrangePartMap.set(+id, first);
        } else seen[name] = +id;
      }
    }
    //console.log(this.spells);
  }

  getStrangePartIndex(partName: string) {
    for (const id in this.parts!) {
      if (this.parts[id].type_name === partName) return +id;
    }
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

type Parts = {
  [id: number]: { type_name: string; level_data: string };
};
