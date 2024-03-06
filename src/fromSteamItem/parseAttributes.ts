import type { MinifiedAttributes } from '../schema/builders/getItemsGame';
import type { SkuType } from '../skuObject';

export function parseAttributes(attributes: MinifiedAttributes): {
  attributes: Pick<SkuType, 'crateseries' | 'target' | 'paint' | 'strangeParts'>;
  isCrate: boolean;
  checkCrateNum: boolean;
} {
  const static_attrs = attributes.static_attrs;
  const sku: {
    crateseries?: number;
    target?: number;
    paint?: number;
    strangeParts?: number[];
  } = {
    crateseries: +static_attrs?.['set supply crate series'] || undefined
  };

  const target = +(attributes.attributes?.['tool target item']?.value ?? static_attrs?.['tool target item'] ?? 0);

  if (target) sku.target = target;

  // Paint cans
  const paint = +attributes.attributes?.['set item tint RGB']?.value || undefined;
  if (paint) sku.paint = paint;

  let strangePartID = 0;
  for (let i = 1; i < 4; i++) {
    if ((strangePartID = +static_attrs?.[`kill eater user score type ${i}`])) {
      sku.strangeParts ??= [];
      sku.strangeParts.push(strangePartID);
    } else break;
  }

  const isCrate =
    sku.crateseries !== undefined ||
    attributes.item_class?.endsWith('_crate') ||
    attributes.armory_desc?.endsWith('_crate') ||
    attributes.prefab === 'eventcratebase' ||
    ((attributes.name.includes('Crate') || attributes.name.includes('Case')) &&
      attributes.attributes?.['decoded by itemdefindex'] !== undefined);

  return { attributes: sku, isCrate, checkCrateNum: isCrate && sku.crateseries === undefined };
}
