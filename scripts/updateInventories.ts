import steamcommunity from 'steamcommunity';
import fsSync from 'fs';
import fs from 'fs/promises';
import dotenv from 'dotenv';
import got from 'got';

dotenv.config();

const community = new steamcommunity();

const users: {
  [steamid: string]: string;
} = JSON.parse(fsSync.readFileSync('./test/inventories/_ids.json', 'utf-8'));

async function main() {
  for (const [steamid, name] of Object.entries(users)) {
    await Promise.all([loadSteamInventory(steamid, name), loadTf2Inventory(steamid, name)]);
    console.log(`Saved inventories of ${name}`);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}
main();
async function loadSteamInventory(steamid: string, fileName: string, errCount = 0) {
  return new Promise((resolve, reject) => {
    //@ts-expect-error dont care
    community.getUserInventoryContents(steamid, 440, 2, true, 'en', (err, inv) => {
      if (err) {
        if (errCount === 4) {
          reject(err);
          return;
        }
        resolve(loadSteamInventory(steamid, fileName, errCount + 1));
        return;
      }
      const prom = fs.writeFile('./test/inventories/' + fileName + '_steam.json', JSON.stringify(inv, undefined, '\t'));
      resolve(prom);
    });
  });
}
function loadTf2Inventory(steamid: string, fileName: string) {
  return got
    .get(
      `https://api.steampowered.com/IEconItems_440/GetPlayerItems/v1/?key=${process.env.API_KEY}&steamid=${steamid}`,
      {
        retry: {
          limit: 15,
          statusCodes: [408, 413, 429, 500, 502, 503, 504, 521, 522, 524],
          calculateDelay: retry => 1200
        }
      }
    )
    .json()
    .then(res => {
      return fs.writeFile(
        './test/inventories/' + fileName + '_attributes.json',
        JSON.stringify((res as any).result, undefined, '\t')
      );
    });
}
