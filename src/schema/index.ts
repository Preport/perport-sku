import { getTfEnglish } from './builders/getTfEnglish';
import { getSchemaItems } from './builders/getSchemaItems';
import { MinifiedAttributes, getItemsGame } from './builders/getItemsGame';
import { getPaintKits } from './builders/getPaintKits';
import { ResultAttribute, getSchemaOverview } from './builders/getSchemaOverview';
import { SpellMap } from './mapExtensions';
import EventEmitter from 'events';
import TypedEmitter from 'typed-emitter';

export interface TwoWayMap extends Map<string | number, string | number> {
  get(key: string): number | undefined;
  get(key: number): string | undefined;

  set(key: string, value: number): this;
  set(key: number, value: string): this;
}

type LiveUpdateKeys =
  | 'killstreakers'
  | 'sheens'
  | 'effects'
  | 'paintKits'
  | 'rarities'
  | 'origins'
  | 'qualities'
  | 'spells'
  | 'cosmeticParts'
  | 'parts'
  | 'itemNames'
  | 'items'
  | 'upgradables';

type SchemaEvents = {
  liveUpdate: (updated: LiveUpdateKeys[]) => void;
  liveUpdateError: (error: Error) => void;
};

//TODO: Create a map to normalize parts that have the same name ie 97,87,0
export class Schema extends (EventEmitter as new () => TypedEmitter<SchemaEvents>) {
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
  //readonly normalizedStrangePartMap = new Map<number, number>();

  private _liveUpdate = 0;
  private interval: NodeJS.Timeout | null = null;

  get liveUpdate(): number {
    return this._liveUpdate;
  }
  /**
   * Value is time in seconds suggested to use 30 minutes-1 hour
   * Using any value <= 0 will stop live updating
   */
  set liveUpdate(value: number) {
    if (this.interval) clearInterval(this.interval);
    if (value <= 0) {
      this.interval = null;
    } else if (value > 0) {
      this.interval = setInterval(() => {
        this.LiveUpdateSchema();
      }, value * 1000);
    }
    this._liveUpdate = value;
  }
  constructor(apiKeyOrSerializedSchema: string) {
    super();
    if (apiKeyOrSerializedSchema.length > 50) {
      // if length is greater than 50, it's most likely a serialized schema since api keys are 32 characters long
      this.deserialize(apiKeyOrSerializedSchema);
      this.#apiKey = '';
      this.readyProm = Promise.resolve();
      return;
    }
    this.#apiKey = apiKeyOrSerializedSchema;
    this.readyProm = this.getSchema();
  }

  private async LiveUpdateSchema() {
    const proms = await Promise.allSettled([
      getSchemaItems(true, this.#apiKey),
      getTfEnglish(true),
      getItemsGame(true),
      getPaintKits(true),
      getSchemaOverview(true, this.#apiKey)
    ]);
    const useCache = [proms[4].status === 'rejected', proms[2].status === 'rejected'] as const;
    const updates: LiveUpdateKeys[] = [];
    proms.forEach((prom, i) => {
      if (prom.status === 'fulfilled') {
        switch (i) {
          case 0:
            this.getSchemaItemsUpdate(prom.value as any, useCache[0], useCache[1]);
            updates.push('itemNames', 'parts', 'cosmeticParts', 'upgradables', 'spells');
            break;
          case 1:
            this.getTfEnglishUpdate(prom.value as any);
            updates.push('killstreakers', 'sheens');
            break;
          case 2:
            this.getItemsGameUpdate(prom.value as any);
            updates.push('items');
            break;
          case 3:
            this.getPaintKitsUpdate(prom.value as any);
            updates.push('paintKits');
            break;
          case 4:
            this.getSchemaOverviewUpdate(prom.value as any);
            updates.push('effects', 'origins', 'qualities');
            break;
        }
      }
    });
    if (updates.length) this.emit('liveUpdate', updates);
    else this.emit('liveUpdateError', new Error('No updates'));
  }

  private schemaOverviewParts: TwoWayMap = new Map();
  private schemaOverviewAttribs: Record<number, ResultAttribute> = {};
  private onSpellsUpdateSchemaOverview() {
    Object.entries(this.schemaOverviewAttribs).forEach(([defindex, attrib]) => {
      if (attrib.name?.startsWith('SPELL: ')) {
        const descStr = attrib.name.startsWith('SPELL: Halloween') ? attrib.description_string! : attrib.name;
        this.spells.setSpell(descStr, +defindex);
      }
    });
  }

  private itemsGameAttribs: Record<number, MinifiedAttributes> = {};
  private onSpellsUpdateItemGame() {
    Object.entries(this.itemsGameAttribs).forEach(([defindex, attrib]) => {
      if (attrib.name?.startsWith('Halloween Spell: ')) {
        const spellName = attrib.name.slice(17);
        this.spells.setSpell(spellName, +defindex);
        const usageAttribs = attrib.tool?.usage?.attributes;
        if (!usageAttribs) return;
        this.spells.setSpellLookup(+defindex, usageAttribs);
      }
    });
  }

  private onPartsUpdate() {
    for (const [id, name] of this.schemaOverviewParts.entries() as IterableIterator<[number, string]>) {
      this.parts.has(id) && this.parts.set(name, id);
    }
  }

  private getSchemaItemsUpdate(
    schemaItems: Awaited<ReturnType<typeof getSchemaItems>>,
    useSchemaOverviewCache: boolean,
    useItemsGameCache: boolean
  ) {
    this.itemNames = schemaItems.items;
    this.parts = schemaItems.parts;
    this.cosmeticParts = schemaItems.cosmeticParts;
    this.upgradables = schemaItems.upgradables;
    this.spells = schemaItems.spells;
    // Also update overviewParts
    if (useSchemaOverviewCache) {
      this.onPartsUpdate();
      this.onSpellsUpdateSchemaOverview();
    }
    if (useItemsGameCache) this.onSpellsUpdateItemGame();
  }

  private getTfEnglishUpdate(tfEnglish: Awaited<ReturnType<typeof getTfEnglish>>) {
    this.killstreakers = tfEnglish.killstreakers;
    this.sheens = tfEnglish.sheens;
  }

  private getItemsGameUpdate(itemsGame: Awaited<ReturnType<typeof getItemsGame>>) {
    this.items = itemsGame.attribs;
    this.itemsGameAttribs = itemsGame.attribs;
    this.onSpellsUpdateItemGame();
  }

  private getPaintKitsUpdate(paintKits: Awaited<ReturnType<typeof getPaintKits>>) {
    this.paintKits = paintKits;
  }
  private getSchemaOverviewUpdate(schemaOverview: Awaited<ReturnType<typeof getSchemaOverview>>) {
    this.effects = schemaOverview.effects;
    this.origins = schemaOverview.origins;
    this.qualities = schemaOverview.qualities;

    this.schemaOverviewAttribs = schemaOverview.attributes;
    this.schemaOverviewParts = schemaOverview.parts;
    this.onPartsUpdate();
    this.onSpellsUpdateSchemaOverview();
  }
  private async getSchema() {
    const [schemaItems, tfEnglish, itemsGame, paintKits, schemaOverview] = await Promise.all([
      getSchemaItems(undefined, this.#apiKey),
      getTfEnglish(),
      getItemsGame(),
      getPaintKits(),
      getSchemaOverview(undefined, this.#apiKey)
    ]);

    this.getSchemaItemsUpdate(schemaItems, false, false);
    this.getSchemaOverviewUpdate(schemaOverview);
    this.getTfEnglishUpdate(tfEnglish);
    this.getItemsGameUpdate(itemsGame);
    this.getPaintKitsUpdate(paintKits);
  }

  public serialize(): string {
    return JSON.stringify({
      killstreakers: Array.from(this.killstreakers.entries()),
      sheens: Array.from(this.sheens.entries()),
      effects: Array.from(this.effects.entries()),
      paintKits: Array.from(this.paintKits.entries()),
      rarities: Array.from(this.rarities.entries()),
      origins: Array.from(this.origins.entries()),
      qualities: Array.from(this.qualities.entries()),
      spells: Array.from(this.spells.entries()),
      cosmeticParts: Array.from(this.cosmeticParts.entries()),
      parts: Array.from(this.parts.entries()),
      itemNames: Array.from(this.itemNames.entries()),
      items: this.items
      //defindexMap: Array.from(this.defindexMap.entries())
    });
  }

  private deserialize(serializedSchema: string): void {
    const schema = JSON.parse(serializedSchema);
    this.killstreakers = new Map(schema.killstreakers) as TwoWayMap;
    this.sheens = new Map(schema.sheens) as TwoWayMap;
    this.effects = new Map(schema.effects) as TwoWayMap;
    this.paintKits = new Map(schema.paintKits) as TwoWayMap;
    this.rarities = new Map(schema.rarities) as TwoWayMap;
    this.origins = new Map(schema.origins) as TwoWayMap;
    this.qualities = new Map(schema.qualities) as TwoWayMap;
    this.spells = new SpellMap(schema.spells);
    this.cosmeticParts = new Map(schema.cosmeticParts) as TwoWayMap;
    this.parts = new Map(schema.parts) as TwoWayMap;
    this.itemNames = new Map(schema.itemNames) as TwoWayMap;
    this.items = schema.items;
    //this.defindexMap = new Map(schema.defindexMap);
  }
}
