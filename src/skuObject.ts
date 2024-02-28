import { Schema } from './schema';

export class Sku {
  defindex: number = 0;
  quality: number = 0;

  normalized: boolean = false;

  uncraftable: boolean = false;
  killstreak: number = 0;
  australium: boolean = false;
  festive: boolean = false;

  // optionals
  effect?: number;
  paintKit?: number;
  wear?: number;
  quality2?: number;
  target?: number;
  craftnumber?: number;
  crateseries?: number;
  output?: number;
  outputQuality?: number;

  // extras
  paint?: number;
  spells?: number[];
  strangeParts?: number[];
  sheen?: number;
  killstreaker?: number;

  public static readonly regex =
    /^(\d+);(\d+)(;norm)?(?:;u(\d+))?(;australium)?(;uncraftable)?(?:;w(\d+))?(?:;pk(\d+))?(;strange)?(?:;kt-(\d+))?(?:;td-(\d+))?(;festive)?(?:;n(\d+))?(?:;c(\d+))?(?:;od-(\d+))?(?:;oq-(\d+))?(?:;p(\d+))?(?:;sp([\d,]+))?(?:;pt([\d,]+))?(?:;sh(\d+))?(?:;ks(\d+))?$/;

  //#region static params and stringparams
  private static readonly params = Object.freeze([
    'defindex',
    'quality',
    'normalized',
    'effect',
    'australium',
    'uncraftable',
    'wear',
    'paintKit',
    'quality2',
    'killstreak',
    'target',
    'festive',
    'craftnumber',
    'crateseries',
    'output',
    'outputQuality',
    // weak params
    'paint',
    'spells',
    'strangeParts',
    'sheen',
    'killstreaker'
  ] as const);

  private static readonly stringParams = Object.freeze([
    /*defindex, quality*/ 'norm',
    'u',
    'australium',
    'uncraftable',
    'w',
    'pk',
    'strange',
    'kt-',
    'td-',
    'festive',
    'n',
    'c',
    'od-',
    'oq-',
    // weak params
    'p',
    'sp',
    'pt',
    'sh',
    'ks'
  ] as const);
  //#endregion
  private static readonly WEAK_PROPS_LENGTH = 5;
  constructor(sku: string | SkuType) {
    if (typeof sku !== 'string') {
      Object.entries(sku).forEach(entry => {
        //clone the spells and parts array to avoid weird behaviour
        if (typeof entry[1] === 'object') {
          this[entry[0]] = structuredClone(entry[1]).sort((a, b) => a - b);
        } else this[entry[0]] = entry[1];
      });
      return;
    }
    const reg = Sku.regex.exec(sku);

    if (!reg) throw new Error(`Invalid sku should be in format 5021;6.... Received ${sku}`);
    for (let i = 0; i < Sku.params.length; i++) {
      let value: string | boolean | number | number[] = reg[i + 1];

      if (value === undefined) continue;

      const param = Sku.params[i];

      if (param === 'spells' || param === 'strangeParts') {
        value = value
          .split(',')
          .filter(i => i !== undefined)
          .map(i => +i)
          .sort((a, b) => a - b);
      } else
        switch (value) {
          case ';australium':
          case ';festive':
          case ';uncraftable':
          case ';norm':
            value = true;
            break;
          case ';strange':
            value = 11;
            break;
          default:
            value = +value;
        }

      //@ts-expect-error stfu ts you can't stop me from typing hot garbage
      this[param] = value;
    }
  }

  /**
   * Modifies the sku object if not normalized, does nothing if normalized is set to **true**!
   */
  normalize(schema: Schema) {
    if (this.normalized) return this;
    // should normalize defindex, strangeParts
    for (let i = 0; i < (this.strangeParts?.length || 0); i++) {
      this.strangeParts![i] = schema.normalizedStrangePartMap.get(this.strangeParts![i]) ?? this.strangeParts![i];
    }
    this.strangeParts?.sort((a, b) => a - b);
    this.normalized = true;
    return this;
  }
  /**
   * @param weak if set to `true` will not add paint and spells to the sku
   */
  toString(weak = false) {
    let str = `${this.defindex};${this.quality}`;

    const length = Sku.stringParams.length - (weak ? Sku.WEAK_PROPS_LENGTH : 0);
    for (let i = 0; i < length; i++) {
      const param = this[Sku.params[i + 2]];
      if (param === undefined) continue;

      const stringParam = Sku.stringParams[i];

      switch (typeof param) {
        case 'boolean':
          str += param ? `;${stringParam}` : '';
          break;
        case 'object':
          str += `;${stringParam}${param.join(',')}`;
          break;
        case 'number':
          if (param === 0 && stringParam === 'kt-') continue;
          str += `;${stringParam}${stringParam === 'strange' ? '' : param}`;
          break;
        default:
          throw new Error(
            `Expected a property that has a value of number, array, or number received a ${typeof param} with value ${param} on ${stringParam} instead`
          );
      }
    }

    return str;
  }

  //#region compare and static compare functions
  /**
   * @param weak if set to `true` will not compare extras such as paint and spells
   */
  compare(
    otherSku: string | SkuType,
    weak?: true,
    ...ignoreProps: ExceptLastFive<typeof Sku.params>[number][]
  ): boolean;
  compare(otherSku: string | SkuType, weak?: false, ...ignoreProps: (typeof Sku.params)[number][]): boolean;
  compare(otherSku: string | SkuType, weak = false, ...ignoreProps: (typeof Sku.params)[number][]): boolean {
    //@ts-expect-error
    return Sku.compare(this, otherSku, weak, ignoreProps);
  }

  /**
   * @param weak if set to `true` will not compare extras such as paint and spells
   */
  static compare(
    sku1: string | SkuType,
    sku2: string | SkuType,
    weak?: true,
    ...ignoreProps: ExceptLastFive<typeof Sku.params>[number][]
  ): boolean;
  static compare(
    sku1: string | SkuType,
    sku2: string | SkuType,
    weak?: false,
    ...ignoreProps: (typeof Sku.params)[number][]
  ): boolean;
  static compare(
    sku1: string | SkuType,
    sku2: string | SkuType,
    weak = false,
    ...ignoreProps: (typeof Sku.params)[number][]
  ): boolean {
    const sk1 = typeof sku1 === 'string' ? new Sku(sku1) : sku1;
    const sk2 = typeof sku2 === 'string' ? new Sku(sku2) : sku2;

    const length = Sku.params.length - (weak ? Sku.WEAK_PROPS_LENGTH : 0);
    for (let i = 0; i < length; i++) {
      const param = Sku.params[i];
      if (ignoreProps.includes(param)) continue;
      if (
        typeof sk1[param] === 'object' &&
        typeof sk2[param] === 'object' &&
        (sk1[param] as number[]).length === (sk2[param] as number[]).length &&
        !(sk1[param] as number[]).some((val, i) => val !== (sk2[param] as number[])[i])
      )
        continue;
      if (sk1[param] !== sk2[param]) return false;
    }

    return true;
  }
  //#endregion
}

export type SkuType = PropertiesOf<Sku>;

type PropertiesOf<T> = {
  [K in keyof T as T[K] extends Function ? never : K]: T[K];
};
type ExceptLastFive<T extends readonly string[]> = T extends readonly [
  ...infer Items,
  string,
  string,
  string,
  string,
  string
]
  ? Items
  : never;
