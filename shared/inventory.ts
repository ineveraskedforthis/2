import { ARMOUR, EQUIP_SLOT, MATERIAL, SKILL, WEAPON, armour_string_id, equip_slot_string_id, weapon_string_id } from "../game_content/src/content.js"
import { character_id } from "./ids.js"

export interface damageSocket {
    fire: number
    blunt: number
    pierce: number
    slice: number
}

export type backpack = {
    items: ItemBackpackData[]
}

export type equip = Partial<Record<equip_slot_string_id, ItemData>>

export interface CharacterImageData {
    id: character_id
    equip: equip,
    dead: boolean,
    body: string
}

export type EquipSocket = {
    equip: equip
    backpack: backpack;
}



export interface WeaponData {
    name: string,
    id: number,
    prototype_id: weapon_string_id
    affixes: number,
    damage: damageSocket,
    ranged_damage: number,
    resists: damageSocket,
    affixes_list: affix[],
    item_type: EQUIP_SLOT
    durability: number
    is_weapon: true
    price?: number
    backpack_index?: number,
}

export interface ArmourData {
    name: string,
    id: number,
    prototype_id: armour_string_id
    affixes: number,
    damage: damageSocket,
    ranged_damage: number,
    resists: damageSocket,
    affixes_list: affix[],
    item_type: EQUIP_SLOT
    durability: number
    is_weapon: false
    price?: number
    backpack_index?: number,
}

export interface WeaponBackpackData extends WeaponData {
    backpack_index: number
}

export interface ArmourBackpackData extends ArmourData {
    backpack_index: number
}

export interface WeaponOrderData extends WeaponData {
    price: number
    seller: string
    seller_id: number
}
export interface ArmourOrderData extends ArmourData {
    price: number
    seller: string
    seller_id: number
}

export type ItemData = WeaponData | ArmourData
export type ItemBackpackData = WeaponBackpackData | ArmourBackpackData
export type ItemOrderData = WeaponOrderData | ArmourOrderData

export interface EquipSlotData {
    equip_slot: equip_slot_string_id
    item: ItemData
}

export type affix_tag = 'of_heat'|'layered'|'sharp'|'heavy'|'hot'|'precise'|'of_power'|'of_madness'|'calm'|'daemonic'|'notched'|'thick'|'hard'|'of_elodino_pleasure'|'of_graci_beauty'|'of_elder_beast'|'of_protection'|'of_painful_protection'

export interface affix{
    tag: affix_tag;
}


// export type equip_slot = armour_slot|'weapon'
// export type armour_slot = 'skirt'|'amulet'|'mail'|'greaves'|'left_pauldron'|'right_pauldron'|'left_gauntlet'|'right_gauntlet'|'boots'|'helmet'|'belt'|'robe'
// export type secondary_slot = 'secondary'
// export type slot = secondary_slot | equip_slot

export type damage_type = 'blunt'|'pierce'|'slice'|'fire'
export interface box {
    material: MATERIAL;
    amount: number;
}

export interface skill_check {
    skill: SKILL;
    difficulty: number;
}

export interface skill_checks_container {
    skill_checks: skill_check[]
}

export interface skilled_box extends box, skill_checks_container {

}

export interface CraftBulkTemplate {
    id: string;
    input: box[];
    output: skilled_box[];
}
export interface CraftItemTemplate {
    id: string;
    input: box[];
    output: EQUIPMENT_PIECE;
    output_affixes: affix[];
    difficulty: skill_check[];
}
export interface ItemJson {
    durability: number
    affixes: affix[]
    model_tag: string
}
export interface TaggedCraftBulk {
    tag: string,
    value: CraftBulkTemplate
}
export interface TaggedCraftItem {
    tag: string,
    value: CraftItemTemplate
}export type EQUIPMENT_PIECE = { value: WEAPON; tag: "weapon"}  | { value: ARMOUR; tag: "armour"}

