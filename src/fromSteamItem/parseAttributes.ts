import type { SkuType } from '../skuObject';

type AttributeType = {
  static_attrs: Record<string, `${number}`>;
  attributes: Record<string, Record<string, any>>;
};
export function parseAttributes(
  attributes: AttributeType
): Pick<SkuType, 'crateseries' | 'target' | 'output' | 'outputQuality'> {
  const sku: {
    crateseries?: number;
    target?: number;
  } = {
    crateseries: +attributes.static_attrs?.['set supply crate series'] || undefined
  };

  const target = +attributes.attributes?.['tool target item'] || undefined;

  if (target) sku.target = target;

  return sku;
}
