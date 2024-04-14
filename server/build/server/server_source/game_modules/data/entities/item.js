"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Armour = exports.Weapon = exports.Item = void 0;
const data_id_1 = require("../data_id");
const content_1 = require("@content/content");
class Item {
    constructor(id, durability, affixes) {
        if (id == undefined) {
            this.id = data_id_1.DataID.Items.new_id();
        }
        else {
            this.id = id;
            data_id_1.DataID.Items.register(id);
        }
        this.durability = durability;
        this.affixes = affixes;
    }
}
exports.Item = Item;
class Weapon extends Item {
    constructor(id, durability, affixes, prototype) {
        super(id, durability, affixes);
        this.prototype_weapon = prototype;
    }
    get prototype() {
        return content_1.WeaponStorage.get(this.prototype_weapon);
    }
    toJSON() {
        return {
            id: this.id,
            durability: this.durability,
            affixes: this.affixes,
            price: this.price,
            prototype_weapon: content_1.WeaponConfiguration.WEAPON_WEAPON_STRING[this.prototype_weapon]
        };
    }
}
exports.Weapon = Weapon;
class Armour extends Item {
    constructor(id, durability, affixes, prototype) {
        super(id, durability, affixes);
        this.prototype_armour = prototype;
    }
    get prototype() {
        return content_1.ArmourStorage.get(this.prototype_armour);
    }
    toJSON() {
        return {
            id: this.id,
            durability: this.durability,
            affixes: this.affixes,
            price: this.price,
            prototype_armour: content_1.ArmourConfiguration.ARMOUR_ARMOUR_STRING[this.prototype_armour]
        };
    }
}
exports.Armour = Armour;
