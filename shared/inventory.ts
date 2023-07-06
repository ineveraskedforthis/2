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
    [index in equip_slot]?: ItemData; 
}

export type EquipSocket = {
    equip: equip
    backpack: backpack;
}

export interface ItemData {
    name: string,
    affixes: number,
    damage: damageSocket,
    ranged_damage: number,
    resists: damageSocket,
    affixes_list: affix[],
    item_type: equip_slot
    durability: number
    backpack_index?: number
    price?: number
    seller?: string
    seller_id?: number
    id?: number
    is_weapon: boolean
}

export type affix_tag = 'of_heat'|'layered'|'sharp'|'heavy'|'hot'|'precise'|'of_power'|'of_madness'|'calm'|'daemonic'|'notched'|'thick'|'hard'|'of_elodino_pleasure'|'of_graci_beauty'|'of_elder_beast'|'of_protection'|'of_painful_protection'

export interface affix{
    tag: affix_tag;
}

export const slots = [
    'weapon', 
    'secondary', 
    'amulet', 
    'mail', 
    // 'greaves', 
    'left_pauldron', 
    'right_pauldron', 
    'left_gauntlet', 
    'right_gauntlet', 
    'boots', 'helmet', 
    'belt', 
    'robe', 
    'shirt', 
    'pants', 
    'dress', 
    'socks'] as const
export type equip_slot = typeof slots[number]

// export type equip_slot = armour_slot|'weapon'
// export type armour_slot = 'skirt'|'amulet'|'mail'|'greaves'|'left_pauldron'|'right_pauldron'|'left_gauntlet'|'right_gauntlet'|'boots'|'helmet'|'belt'|'robe'
// export type secondary_slot = 'secondary' 
// export type slot = secondary_slot | equip_slot

export type damage_type = 'blunt'|'pierce'|'slice'|'fire'