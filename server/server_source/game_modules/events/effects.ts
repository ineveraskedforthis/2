import { equip_slot } from "../../../../shared/inventory";
import { Character } from "../character/character";
import { skill } from "../character/skills";
import { Perks } from "../character/Perks";
import { UI_Part } from "../client_communication/causality_graph";
import { UserManagement } from "../client_communication/user_manager";
import { character_list } from "../data";
import { Cell } from "../map/cell";
import { Convert } from "../systems_communication";
import { Request } from "../client_communication/network_actions/request";

export namespace Effect {
    export namespace Update {
        export function cell_market(cell: Cell) {
            const locals = cell.get_characters_list()
            for (let item of locals) {
                const id = item.id
                const local_character = Convert.id_to_character(id)
                UserManagement.add_user_to_update_queue(local_character.user_id, UI_Part.MARKET)
            }
        }
    }

    export function change_durability(character: Character, slot: equip_slot, dx: number) {
        const item = character.equip.slot_to_item(slot)
        if (item == undefined) return
        item.durability += dx

        if (item.durability < 1) destroy_item(character, slot)

        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.BELONGINGS)
    }

    export function destroy_item(character:Character, slot: equip_slot) {
        character.equip.destroy_slot(slot)
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.BELONGINGS)
    }

    export namespace Change {
        export function fatigue(character: Character, dx: number) {
            character.change_fatigue(dx)
            UserManagement.add_user_to_update_queue(character.user_id, UI_Part.STATUS)
        }

        export function stress(character: Character, dx: number) {
            character.change_stress(dx)
            UserManagement.add_user_to_update_queue(character.user_id, UI_Part.STATUS)
        }

        export function rage(character: Character, dx: number) {
            character.change_rage(dx)
            UserManagement.add_user_to_update_queue(character.user_id, UI_Part.STATUS)
        }

        export function skill(character: Character, skill: skill, dx: number) {
            character.skills[skill] += dx 
            if (character.skills[skill] > 100) 
                character.skills[skill] = 100
            UserManagement.add_user_to_update_queue(character.user_id, UI_Part.SKILLS)
        }
    }

    export function learn_perk(student: Character, perk: Perks){
        student.perks[perk] = true
        UserManagement.add_user_to_update_queue(student.user_id, UI_Part.SKILLS)
    }
}