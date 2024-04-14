// branded numbers for use in ids

export type cell_id             = number & { __brand: "cell"; };
export type character_id        = number & { __brand: "character_id"; };
export type user_id             = number & { __brand: "user_id"; };
export type user_online_id      = user_id & { __brand2: "online"; };
export type location_id         = number & { __brand: "location_id"; };
export type market_order_id     = number & { __brand: "bulk_order"; };
export type order_item_id_raw   = number & { __brand: "auction_order_id"; __brand2: "raw"; };
export type item_id             = number & { __brand: "item"; };
export type backpack_id         = number & { __brand: "backpack"; };