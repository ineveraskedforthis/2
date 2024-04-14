import { item_id } from "@custom_types/ids"
import { affix } from "@custom_types/inventory"
import { WEAPON, ARMOUR, MATERIAL } from "@content/content"

export interface ItemInterface {
    id: item_id,
    durability: number
    affixes: affix[]
}

export interface PricedItem extends ItemInterface {
    price: number
}

export function is_priced_item(x: ItemInterface): x is PricedItem {
    return "price" in x
}

export interface WeaponInterface extends ItemInterface {
    readonly prototype_weapon: WEAPON
}

export function is_weapon(x: ItemInterface) : x is WeaponInterface {
    return "prototype_weapon" in x
}

export interface ArmourInterface extends ItemInterface {
    readonly prototype_armour: ARMOUR
}

export function is_armour(x: ItemInterface) : x is ArmourInterface {
    return "prototype_armour" in x
}

export type EquipmentPieceInterface = WeaponInterface | ArmourInterface

export type AMMO_BOW = MATERIAL.ARROW_BONE | MATERIAL.ARROW_ZAZ