import { Schema } from '../src/schema';
import { readFile } from 'fs/promises';
import { fromAttributes } from '../src/fromAttributes';
import { fromSteamItem } from '../src/fromSteamItem';

let schema: Schema;
beforeAll(async () => {
  if (!process.env.API_KEY) throw new Error('Missing env variable API_KEY');

  schema = new Schema(process.env.API_KEY);
  await schema.readyProm;
}, 25_000);

const items: {
  [assetid: number]: {
    [parser: string]: string;
  };
}[] = [];
function addItem(parser: string, assetid: number, sku: string): string {
  (items[assetid] ??= {})[parser] = sku;
  return sku;
}
describe('Parse inventories', () => {
  it("Should parse Hack The Gibson's inventory from steam-api", async () => {
    const inv = await readSteamInventory('gibson');

    inv.map(item => addItem('steam', item.assetid, fromSteamItem(item, schema).toString()));
  }, 30_000);

  it("Should parse Hack The Gibson's inventory from tf2-api", async () => {
    const attribs = await readAttributes('gibson');

    attribs.map(item => addItem('tf2', item.id, fromAttributes(item, schema).toString()));
  }, 30_000);

  it("Should parse Oli's inventory from steam-api", async () => {
    const inv = await readSteamInventory('oli');

    inv.map(item => addItem('steam', item.assetid, fromSteamItem(item, schema).toString()));
  }, 30_000);

  it("Should parse Oli's inventory from tf2-api", async () => {
    const attribs = await readAttributes('oli');

    attribs.map(item => addItem('tf2', item.id, fromAttributes(item, schema).toString()));
  }, 30_000);

  it("Should parse Frost's inventory from steam-api", async () => {
    const inv = await readSteamInventory('frost');

    inv.map(item => addItem('steam', item.assetid, fromSteamItem(item, schema).toString()));
  }, 30_000);

  it("Should parse Frost's inventory from tf2-api", async () => {
    const attribs = await readAttributes('frost');

    attribs.map(item => addItem('tf2', item.id, fromAttributes(item, schema).toString()));
  }, 30_000);

  it("Should parse Arthur's inventory from steam-api", async () => {
    const inv = await readSteamInventory('arthur');

    inv.map(item => addItem('steam', item.assetid, fromSteamItem(item, schema).toString()));
  }, 30_000);

  it("Should parse Arthur's inventory from tf2-api", async () => {
    const attribs = await readAttributes('arthur');

    attribs.map(item => addItem('tf2', item.id, fromAttributes(item, schema).toString()));
  }, 30_000);

  it("Should parse Scrap1's inventory from steam-api", async () => {
    const inv = await readSteamInventory('scrap1');

    inv.map(item => addItem('steam', item.assetid, fromSteamItem(item, schema).toString()));
  }, 30_000);

  it("Should parse Scrap1's inventory from tf2-api", async () => {
    const attribs = await readAttributes('scrap1');

    attribs.map(item => addItem('tf2', item.id, fromAttributes(item, schema).toString()));
  }, 30_000);

  it("Should parse Joekiller's inventory from steam-api", async () => {
    const inv = await readSteamInventory('joekiller');

    inv.map(item => addItem('steam', item.assetid, fromSteamItem(item, schema).toString()));
  }, 30_000);

  it("Should parse Joekiller's inventory from tf2-api", async () => {
    const attribs = await readAttributes('joekiller');

    attribs.map(item => addItem('tf2', item.id, fromAttributes(item, schema).toString()));
  }, 30_000);

  it("Should parse Wayne's inventory from steam-api", async () => {
    const inv = await readSteamInventory('wayne');

    inv.map(item => addItem('steam', item.assetid, fromSteamItem(item, schema).toString()));
  }, 30_000);

  it("Should parse Wayne's inventory from tf2-api", async () => {
    const attribs = await readAttributes('wayne');

    attribs.map(item => addItem('tf2', item.id, fromAttributes(item, schema).toString()));
  }, 30_000);
  //#script Insert above me

  afterAll(() => {
    const skipped: string[] = [
      '13271895045', // has 2 invis parts on tf2 attribs and none on steam
      '15209372419', // high craft item with custom name tag
      '13697214568' // has 1 invis part
    ];
    let errString = '';
    for (const assetid in items) {
      const values = Object.values(items[assetid]);

      if (!values.every(value => value === values[0]) && !skipped.includes(assetid)) {
        errString += `Not all parsers returned the same sku for id(${assetid}). Object: ${JSON.stringify(
          items[assetid],
          undefined,
          '\t'
        )}`;
      }
    }
    expect(errString).toBe('');
  });

  afterAll(async () => {
    // Test Schema LiveUpdate
    schema.liveUpdate = 1;
    expect(schema.liveUpdate).toBe(1);
    schema.liveUpdate = 0;
    expect(schema.liveUpdate).toBe(0);
    schema.liveUpdate = -1000;
    expect(schema.liveUpdate).toBe(-1000);

    // Test Schema serialization
    const serializedSchema = schema.serialize();
    const schema2 = new Schema(serializedSchema);
    expect(schema2.serialize()).toBe(serializedSchema);

    const mockHandler = jest.fn();
    const mockHandler2 = jest.fn();

    schema.on('liveUpdateError', mockHandler);
    schema2.on('liveUpdate', mockHandler2);

    await schema['LiveUpdateSchema']();

    expect(mockHandler).toBeCalledTimes(1);
    expect(mockHandler2).toBeCalledTimes(0);
  });
});

type names = 'gibson' | 'oli' | 'frost' | 'arthur' | 'scrap1' | 'joekiller' | 'wayne';
async function readAttributes(name: names) {
  return JSON.parse(await readFile(`${__dirname}/inventories/${name}_attributes.json`, 'utf8')).items;
}

async function readSteamInventory(name: names) {
  return JSON.parse(await readFile(`${__dirname}/inventories/${name}_steam.json`, 'utf8'));
}
