import { writeFileSync } from 'fs';
import { getItemsGame } from './getItemsGame';

describe('getItemsGame', () => {
  it('should fetch items_game.txt', async () => {
    const itemsGame = await getItemsGame();
    writeFileSync('./tmp/items_game.txt', JSON.stringify(itemsGame));
  });
});
