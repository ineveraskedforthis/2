import { DataID } from "../data_id";
import { WeaponStorage, WeaponConfiguration, ArmourConfiguration, ArmourStorage } from "@content/content";
export class Item {
    constructor(id, durability, affixes) {
        if (id == undefined) {
            this.id = DataID.Items.new_id();
        }
        else {
            this.id = id;
            DataID.Items.register(id);
        }
        this.durability = durability;
        this.affixes = affixes;
    }
}
export class Weapon extends Item {
    constructor(id, durability, affixes, prototype) {
        super(id, durability, affixes);
        this.prototype_weapon = prototype;
    }
    get prototype() {
        return WeaponStorage.get(this.prototype_weapon);
    }
    toJSON() {
        return {
            id: this.id,
            durability: this.durability,
            affixes: this.affixes,
            price: this.price,
            prototype_weapon: WeaponConfiguration.WEAPON_WEAPON_STRING[this.prototype_weapon]
        };
    }
}
export class Armour extends Item {
    constructor(id, durability, affixes, prototype) {
        super(id, durability, affixes);
        this.prototype_armour = prototype;
    }
    get prototype() {
        return ArmourStorage.get(this.prototype_armour);
    }
    toJSON() {
        return {
            id: this.id,
            durability: this.durability,
            affixes: this.affixes,
            price: this.price,
            prototype_armour: ArmourConfiguration.ARMOUR_ARMOUR_STRING[this.prototype_armour]
        };
    }
}
