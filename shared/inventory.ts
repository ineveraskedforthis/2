export interface damageSocket {
    fire: number
    blunt: number
    pierce: number
    slice: number
}

export type backpack = {
    items: ItemData[]
}

export type equip = {
    [index in slot]: ItemData|undefined; 
}

export type EquipSocket = {
    equip: equip
    backpack: backpack;
}

export interface ItemData {
    name: string,
    affixes: number,
    damage: damageSocket
    resists: damageSocket
    affixes_list: affix[]
    item_type: equip_slot
    backpack_index?: number
    price?: number
    seller?: string
    id?: number
    is_weapon: boolean
}

export type affix_tag = 'of_heat'|'layered'|'sharp'|'heavy'|'hot'|'precise'|'of_power'|'of_madness'|'calm'|'daemonic'|'notched'|'thick'|'hard'|'of_elodino_pleasure'|'of_graci_beauty'|'of_elder_beast'|'of_protection'|'of_painful_protection'

export interface affix{
    tag: affix_tag;
}

export type equip_slot = 'body'|'legs'|'arms'|'head'|'foot'|'weapon'
export type armour_slot = 'body'|'legs'|'arms'|'head'|'foot'
export type secondary_slot = 'secondary' 
export type slot = secondary_slot | equip_slot

export type damage_type = 'blunt'|'pierce'|'slice'|'fire'