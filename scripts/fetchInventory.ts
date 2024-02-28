import steamcommunity from 'steamcommunity';
import fs from 'fs';

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
});
