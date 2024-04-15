import { money } from "@custom_types/common"
import { affix } from "@custom_types/inventory"
import { ItemInterface, WeaponInterface, ArmourInterface } from "../../../content_wrappers/item"
import { item_id } from "@custom_types/ids"
import { DataID } from "../data_id"
import { WEAPON, WeaponStorage, WeaponConfiguration, ArmourConfiguration, ARMOUR, ArmourStorage, weapon_string_id, armour_string_id } from "@content/content"

export class Item implements ItemInterface {
    id: item_id
    durability: number
    affixes: affix[]
    price: undefined | money

    constructor(id: item_id|undefined, durability: number, affixes: affix[]) {
        if (id == undefined) {
            this.id = DataID.Items.new_id()
        } else {
            this.id = id
            DataID.Items.register(id)
        }

        this.durability = durability
        this.affixes = affixes
    }
}

export class Weapon extends Item implements WeaponInterface {
    readonly prototype_weapon: WEAPON

    constructor(id: item_id|undefined, durability: number, affixes: affix[], prototype: WEAPON) {
        super(id, durability, affixes)
        this.prototype_weapon = prototype
    }

    get prototype() {
        return WeaponStorage.get(this.prototype_weapon)
    }

    toJSON(): WeaponSaveData {
        return {
            id: this.id,
            durability: this.durability,
            affixes: this.affixes,
            price: this.price,

            prototype_weapon: WeaponConfiguration.WEAPON_WEAPON_STRING[this.prototype_weapon]
        }
    }
}

export class Armour extends Item implements ArmourInterface {
    readonly prototype_armour: ARMOUR

    constructor(id: item_id|undefined, durability: number, affixes: affix[], prototype: ARMOUR) {
        super(id, durability, affixes)
        this.prototype_armour = prototype
    }

    get prototype() {
        return ArmourStorage.get(this.prototype_armour)
    }

    toJSON(): ArmourSaveData {
        return {
            id: this.id,
            durability: this.durability,
            affixes: this.affixes,
            price: this.price,

            prototype_armour: ArmourConfiguration.ARMOUR_ARMOUR_STRING[this.prototype_armour]
        }
    }
}

export interface ArmourSaveData extends Item {
    prototype_armour: armour_string_id
}

export interface WeaponSaveData extends Item {
    prototype_weapon: weapon_string_id
}

export type EquipmentPieceSaveData = ArmourSaveData | WeaponSaveData

export type EquipmentPiece = Weapon|Armour

