"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Inventory = void 0;
const item_tags_1 = require("../../static_data/item_tags");
class Inventory {
    constructor() {
        this.weapons = [];
        this.armours = [];
        this.total_weight = 0;
    }
    transfer_all(target) {
        for (let i = 0; i < this.weapons.length; i++) {
            let weapon = this.weapons[i];
            if (weapon != undefined) {
                target.equip.add_weapon(weapon);
            }
            this.remove_weapon(i);
        }
        for (let i = 0; i < this.armours.length; i++) {
            let armour = this.armours[i];
            if (armour != undefined) {
                target.equip.add_armour(armour);
            }
            this.remove_armour(i);
        }
    }
    remove_weapon(i) {
        let weapon = this.weapons[i];
        if (weapon != undefined) {
            // this.total_weight = this.total_weight - weapon.get_weight()
            this.weapons[i] = undefined;
        }
    }
    remove_armour(i) {
        let armour = this.armours[i];
        if (armour != undefined) {
            // this.total_weight = this.total_weight - armour.get_weight()
            this.armours[i] = undefined;
        }
    }
    get_json() {
        let data = {};
        data.armours = [];
        data.weapons = [];
        for (let i of this.armours) {
            if (i != undefined) {
                data.armours.push(i.get_json());
            }
        }
        for (let i of this.weapons) {
            if (i != undefined) {
                data.weapons.push(i.get_json());
            }
        }
        return data;
    }
    get_data() {
        let data = {};
        data.armours = [];
        data.weapons = [];
        for (let i in this.armours) {
            let item = this.armours[i];
            if (item != undefined) {
                data.armours.push({ tag: item.get_tag(), affixes: item.affixes.length, affixes_list: item.affixes });
            }
            else {
                data.armours.push(undefined);
            }
        }
        for (let i in this.weapons) {
            let item = this.weapons[i];
            if (item != undefined) {
                data.weapons.push({ tag: item.get_tag(), affixes: item.affixes.length, affixes_list: item.affixes });
            }
            else {
                data.weapons.push(undefined);
            }
        }
        return data;
    }
    load_from_json(data) {
        for (let i of data.armours) {
            this.armours.push(new item_tags_1.Armour(i));
        }
        for (let i of data.weapons) {
            this.weapons.push(new item_tags_1.Weapon(i));
        }
    }
}
exports.Inventory = Inventory;
