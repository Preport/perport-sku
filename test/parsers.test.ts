import { Schema } from '../src/schema/schema';
import { mkdir, readFile, writeFile } from 'fs/promises';
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
    const inv = JSON.parse(await readFile(__dirname + '/testItems.json', 'utf8'));

    const mapped = inv.map(item =>
      addItem('steam', item.assetid, fromSteamItem(item, schema).normalize(schema).toString())
    );
    //console.log(mapped);
    await mkdir('./tmp', { recursive: true });
    await saveJSON('gibson-steamapi-end', mapped);
  }, 30_000);

  it("Should parse Hack The Gibson's inventory from tf2-api", async () => {
    const attribs = JSON.parse(await readFile(__dirname + '/testAttributes.json', 'utf8')).result.items;

    const mapped = attribs.map(item =>
      addItem('tf2', item.id, fromAttributes(item, schema).normalize(schema).toString())
    );
    //console.log(mapped);
    await mkdir('./tmp', { recursive: true });
    await saveJSON('gibson-attributes-end', mapped);
  }, 30_000);

  afterAll(() => {
    for (const assetid in items) {
      const values = Object.values(items[assetid]);
      expect(() => {
        if (!values.every(value => value === values[0])) {
          throw new Error(
            `Not all parsers returned the same sku for id(${assetid}). Object: ${JSON.stringify(
              items[assetid],
              undefined,
              '\t'
            )}`
          );
        }
      }).not.toThrowError();
    }
  });
});

function saveJSON(name: string, file: any) {
  return writeFile(`./tmp/${name}.json`, JSON.stringify(file, undefined, '\t'));
}
