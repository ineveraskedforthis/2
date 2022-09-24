import { materials, material_index } from "../../manager_classes/materials_manager";
import { cell_id, char_id, money } from "../../types";
import { Stash } from "../inventories/stash";
import { Character } from "./character";
import { CharacterTemplate } from "./templates";

var last_character_id = 0
var character_list:Character[]                  = []
var characters_dict:{[_ in char_id]: Character} = {}


export namespace CharacterSystem {
    export function template_to_character(template: CharacterTemplate, name: string|undefined, cell_id: cell_id) {
        last_character_id = last_character_id + 1
        if (name == undefined) name = template.name_generator()
        let character = new Character(last_character_id, -1, -1, '#', cell_id, name, template.archetype, template.stats, template.max_hp)
        character.stats.base_resists.add(template.base_resists)
        characters_dict[character.id] = character
        character_list.push(character)
        return character
    }

    export function id_to_character(id: char_id): Character {
        return characters_dict[id]
    }

    export function transfer_savings(A: Character, B: Character, x: money) {
        A.savings.transfer(B.savings, x)
    }

    export function transfer_stash(A: Character, B:Character, what: material_index, amount: number) {
        A.stash.transfer(B.stash, what, amount)
    }

    export function to_trade_stash(A: Character, material: material_index, amount: number) {
        if (amount > 0) {
            if (A.stash.get(material) < amount) return false
            A.stash.transfer(A.trade_stash, material, amount)
            return true
        }

        if (amount < 0) {
            if (A.trade_stash.get(material) < -amount) return false
            A.trade_stash.transfer(A.stash, material, -amount)
            return true
        }

        return true
    }

    export function to_trade_savings(A: Character, amount: money) {
        if (amount > 0) {
            if (A.savings.get() < amount) return false
            A.savings.transfer(A.trade_savings, amount)
            return true
        }

        if (amount < 0) {
            if (A.trade_savings.get() < -amount) return false
            A.trade_savings.transfer(A.savings, -amount as money)
            return true
        }

        return true
    }

    export function transaction(        A: Character, B: Character, 
                                        savings_A_to_B: money, stash_A_to_B: Stash, 
                                        savings_B_to_A: money, stash_B_to_A: Stash) 
    {
        // transaction validation
        if (A.savings.get() < savings_A_to_B) return false
        if (B.savings.get() < savings_B_to_A) return false
        
        for (let material of materials.get_materials_list()) {
            if (A.stash.get(material) < stash_A_to_B.get(material)) return false
            if (B.stash.get(material) < stash_B_to_A.get(material)) return false
        }


        //transaction is validated, execution
        A.savings.transfer(B.savings, savings_A_to_B)
        B.savings.transfer(A.savings, savings_B_to_A)

        for (let material of materials.get_materials_list()) {
            A.stash.transfer(B.stash, material, stash_A_to_B.get(material))
            B.stash.transfer(A.stash, material, stash_B_to_A.get(material))
        }
        return true
    }
}