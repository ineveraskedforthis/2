import {Weapon, Armour} from "../static_data/item_tags"
import { CharacterGenericPart } from "./character_generic_part";
import { Equip } from "./equip";

export class Inventory{
    weapons: (Weapon|undefined)[];
    armours: (Armour|undefined)[];
    total_weight: number;

    constructor() {
        this.weapons = [];
        this.armours = [];
        this.total_weight = 0;
    }

    transfer_all(target: {equip: Equip}) {
        for (let i = 0; i < this.weapons.length; i++) {
            let weapon = this.weapons[i]
            if (weapon != undefined) {target.equip.add_weapon(weapon)}            
            this.remove_weapon(i)
        }
        for (let i = 0; i < this.armours.length; i++) {
            let armour = this.armours[i]
            if (armour != undefined) {target.equip.add_armour(armour)}            
            this.remove_armour(i)
        }
    }
    remove_weapon(i: number) {
        let weapon = this.weapons[i]
        if (weapon != undefined) {
            // this.total_weight = this.total_weight - weapon.get_weight()
            this.weapons[i] = undefined
        }
    }
    remove_armour(i: number) {
        let armour = this.armours[i]
        if (armour != undefined) {
            // this.total_weight = this.total_weight - armour.get_weight()
            this.armours[i] = undefined
        }
    }

    get_json() {
        let data:any = {}
        data.armours = []
        data.weapons = []
        for (let i of this.armours) {
            if (i != undefined) {
                data.armours.push(i.get_json())
            }
        } 
        for (let i of this.weapons) {
            if (i != undefined) {
                data.weapons.push(i.get_json())
            }
        } 
        return data
    }

    get_data() {
        let data:any = {}
        data.armours = []
        data.weapons = []
        for (let i of this.armours) {
            if (i != undefined) {
                data.armours.push({tag: i.get_tag(), affixes: i.affixes.length, affixes_list: i.affixes})
            } else {
                data.weapons.push(undefined)
            }
        } 
        for (let i of this.weapons) {
            if (i != undefined) {
                data.weapons.push({tag: i.get_tag(), affixes: i.affixes.length, affixes_list: i.affixes})
            } else {
                data.weapons.push(undefined)
            }
        } 
        return data
    }

    load_from_json(data:any) {
        for (let i of data.armours) {
            this.armours.push(new Armour(i))
        }
        for (let i of data.weapons) {
            this.weapons.push(new Weapon(i))
        }
    }
}