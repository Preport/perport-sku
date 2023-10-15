export interface AttributeItemStripped {
  id: number;
  original_id: number;
  defindex: number;
  level: number;
  quality: number;
  inventory: number;
  quantity: number;
  origin: number;
  style?: number;
  flag_cannot_trade?: boolean;
  attributes?: ItemAttribute[];
  flag_cannot_craft?: boolean;
  custom_name?: string;
  custom_desc?: string;
  contained_item?: ContainedItem;
}

export interface ItemAttribute {
  defindex: number;
  value?: number | string;
  float_value?: number;
  account_info?: AccountInfo;
  is_output?: boolean;
  quantity?: number;
  quality?: number;
  match_all_attribs?: boolean;
  attributes?: AttributeAttribute[];
  itemdef?: number;
}

export interface AccountInfo {
  steamid: number;
  personaname: string;
}

export interface AttributeAttribute {
  defindex: number;
  value: number;
  float_value: number;
}

export interface ContainedItem {
  defindex: number;
  level: number;
  quality: number;
  inventory: number;
  quantity: number;
  origin: number;
  flag_cannot_trade: boolean;
  flag_cannot_craft?: boolean;
  attributes?: ContainedItemAttribute[];
  style?: number;
}

export interface ContainedItemAttribute {
  defindex: number;
  value: number | string;
  float_value?: number;
  account_info?: AccountInfo;
}
