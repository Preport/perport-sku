import { UsageAttributes } from './builders/getItemsGame';

export interface TwoWayMap extends Map<string | number, string | number> {
  get(key: string): number | undefined;
  get(key: number): string | undefined;

  set(key: string, value: number): this;
  set(key: number, value: string): this;
}

export class SpellMap extends (Map as new () => TwoWayMap) {
  setSpell(spellName: string, defindex: number): this {
    // get returning undefined is expected
    super.get(spellName)! < defindex || super.set(spellName, defindex);

    // set it only if it doesn't exist
    super.has(defindex) || super.set(defindex, spellName);
    return this;
  }

  setSpellLookup(defindex: number, usageAttribs: UsageAttributes): this {
    const firstAttribKey = Object.keys(usageAttribs)[0];
    const float_val = usageAttribs[firstAttribKey];
    const attribBase = super.get(firstAttribKey);
    if (attribBase === undefined) return this;

    const spellFullDefindex = `${attribBase}-${float_val}`;
    super.set(spellFullDefindex, defindex);
    return this;
  }
  getSpell(spellName: string): number | undefined {
    return super.get(spellName);
  }
  getSpellLookup(baseDefindex: number, float_value: number): number | undefined {
    return super.get(`${baseDefindex}-${float_value}`);
  }
}
/*
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
          */
