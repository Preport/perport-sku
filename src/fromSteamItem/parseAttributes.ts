import type { MinifiedAttributes } from '../schema/builders/getItemsGame';
import type { SkuType } from '../skuObject';

export function parseAttributes(
  attributes: MinifiedAttributes
): Pick<SkuType, 'crateseries' | 'target' | 'paint' | 'strangeParts'> {
  const static_attrs = attributes.static_attrs;
  const sku: {
    crateseries?: number;
    target?: number;
    paint?: number;
    strangeParts?: number[];
  } = {
    crateseries: +static_attrs?.['set supply crate series'] || undefined
  };

  const target = +attributes.attributes?.['tool target item'] || undefined;

  if (target) {
    sku.target = target;
    console.log('TargetAttr', attributes.attributes, target);
  }

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

  return sku;
}
