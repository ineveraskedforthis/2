import { equip_slot } from "../../../../shared/inventory";
import { Character } from "../character/character";
import { skill } from "../character/SkillList";
import { Perks } from "../character/Perks";
import { UI_Part } from "../client_communication/causality_graph";
import { UserManagement } from "../client_communication/user_manager";
import { Data, character_list } from "../data";
import { Cell } from "../map/cell";
import { Convert } from "../systems_communication";
import { Request } from "../client_communication/network_actions/request";
import { building_id, cell_id, char_id, money } from "../types";
import { ScriptedValue } from "./scripted_values";

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

    export namespace Transfer {
        export function savings(from: Character, to: Character, x: money) {
            from.savings.transfer(to.savings, x)
            UserManagement.add_user_to_update_queue(from.user_id, UI_Part.SAVINGS)
            UserManagement.add_user_to_update_queue(to.user_id, UI_Part.SAVINGS)
        }
    }

    export namespace Change {
        export function fatigue(character: Character, dx: number) {
            let prev = character.get_fatigue()
            character.change_fatigue(dx)
            let current = character.get_fatigue()
            let change = current - prev
            if ((dx - change > 0)) {
                stress(character, dx - change)
            }
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

    export function rent_room(character_id: char_id, building_id: building_id) {
        let building = Data.Buildings.from_id(building_id)
        let rooms_not_available = Data.Buildings.occupied_rooms(building_id)
        let owner_id = Data.Buildings.owner(building_id)
        let character = Data.CharacterDB.from_id(character_id)
        if (character.current_building != undefined) {
            return "you are already somewhere"
        }
        if (rooms_not_available >= building.rooms) {
            return "no_rooms"
        }
        if (owner_id == undefined) {
            character.current_building = building_id
            Data.Buildings.occupy_room(building_id)
            return "no_owner"
        }
        let price = ScriptedValue.room_price(building_id, character_id)
        if (character.savings.get() < price) {
            return "not_enough_money"
        }
        let owner = Data.CharacterDB.from_id(owner_id)

        if (owner.cell_id != character.cell_id) return "invalid_cell"
        Effect.Transfer.savings(character, owner, price)
        Data.Buildings.occupy_room(building_id)
        character.current_building = building_id
        return "ok"
    }

    export function leave_room(character_id: char_id) {
        let character = Data.CharacterDB.from_id(character_id)
        if (character.current_building == undefined) return

        Data.Buildings.free_room(character.current_building)
        character.current_building = undefined
    }

    export function new_building(cell_id: cell_id, tier: number, rooms: number, durability: number) {        
        Data.Buildings.create({
            cell_id: cell_id,
            durability: durability,
            tier: tier,
            rooms: rooms,
            kitchen: 0,
            workshop: 0,
            is_inn: false,
            is_elodino: false,
            is_rat_lair: false,
            room_cost: 5 as money
        })
    }
}