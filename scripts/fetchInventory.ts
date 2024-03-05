import steamcommunity from 'steamcommunity';
import fs from 'fs';
import dotenv from 'dotenv';
import got from 'got';

dotenv.config();
const steamid = process.argv[2];

const fileName = process.argv[3];

if (!steamid) {
  console.error('No steamid was provided');
  process.exit(1);
} else if (isNaN(+steamid)) {
  console.error('steamid should be a valid integer');
}

if (!fileName) {
  console.error('No filename was provided');
}

const community = new steamcommunity();

//@ts-expect-error dont care
community.getUserInventoryContents(steamid, 440, 2, true, 'en', (err, inv) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  fs.writeFileSync('./test/inventories/' + fileName + '_steam.json', JSON.stringify(inv, undefined, '\t'));
  cb();
});

got
  .get(`https://api.steampowered.com/IEconItems_440/GetPlayerItems/v1/?key=${process.env.API_KEY}&steamid=${steamid}`, {
    retry: {
      limit: 5,
      statusCodes: [408, 413, 429, 500, 502, 503, 504, 521, 522, 524]
    }
  })
  .json()
  .then(res => {
    fs.writeFileSync(
      './test/inventories/' + fileName + '_attributes.json',
      JSON.stringify((res as any).result, undefined, '\t')
    );
    cb();
  });

let cbCalledBefore = false;
function cb() {
  if (!cbCalledBefore) {
    cbCalledBefore = true;
    return;
  }
  const file = fs
    .readFileSync('./test/parsers.test.ts', 'utf-8')
    .replace(/\/\/#script Insert above me/, templateString(fileName))
    .replace(/type names = (.+);/, `type names = $1 | '${fileName}';`);
  fs.writeFileSync('./test/parsers.test.ts', file);
}
const templateString = (name: string) => `
  it("Should parse ${name[0].toUpperCase() + name.slice(1)}'s inventory from steam-api", async () => {
    const inv = await readSteamInventory('${name}');

    inv.map(item => addItem('steam', item.assetid, fromSteamItem(item, schema).toString()));
  }, 30_000);

  it("Should parse ${name[0].toUpperCase() + name.slice(1)}'s inventory from tf2-api", async () => {
    const attribs = await readAttributes('${name}');

    attribs.map(item => addItem('tf2', item.id, fromAttributes(item, schema).toString()));
  }, 30_000);
  //#script Insert above me
`;
