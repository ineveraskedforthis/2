import { equip_slot } from "../../../../shared/inventory";
import { Character } from "../character/character";
import { skill } from "../character/SkillList";
import { UI_Part } from "../client_communication/causality_graph";
import { UserManagement } from "../client_communication/user_manager";
import { Data} from "../data";
import { Convert } from "../systems_communication";
import { building_id, char_id} from "../types";
import { ScriptedValue } from "./scripted_values";
import { trim } from "../calculations/basic_functions";
import { Perks } from "../../../../shared/character";
import { cell_id, money } from "@custom_types/common";
import { LandPlot, LandPlotType } from "@custom_types/buildings";
import { Alerts } from "../client_communication/network_actions/alerts";
import { Trigger } from "./triggers";

export namespace Effect {
    export namespace Update {
        export function cell_market(cell: cell_id) {
            const locals = Data.Cells.get_characters_list_from_cell(cell) 
            for (let item of locals) {
                const local_character = Convert.id_to_character(item)
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
        let character = Data.CharacterDB.from_id(character_id)
        let response = Trigger.building_is_available(character_id, building_id)
        if (response.response == 'ok') {
            if (response.owner_id != undefined) {
                const owner = Data.CharacterDB.from_id(response.owner_id)
                Effect.Transfer.savings(character, owner, response.price)
            }
            enter_room(character_id, building_id)
        }        
        return response
    }

    export function enter_room(character_id: char_id, building_id: building_id) {
        Effect.leave_room(character_id)
        let character = Data.CharacterDB.from_id(character_id)
        Data.Buildings.occupy_room(building_id)
        character.current_building = building_id
        Alerts.enter_room(character)
    }

    export function leave_room(character_id: char_id) {
        let character = Data.CharacterDB.from_id(character_id)
        if (character.current_building == undefined) return
        Data.Buildings.free_room(character.current_building)
        Alerts.leave_room(character)
        character.current_building = undefined
    }

    export function new_building(cell_id: cell_id, type: LandPlotType, durability: number, room_cost: money) {        
        return Data.Buildings.create({
            cell_id: cell_id,
            durability: durability,
            type: type,
            room_cost: room_cost
        })
    }

    export function building_quality_reduction_roll(building: LandPlot) {
        if (building.type == LandPlotType.ForestPlot) return;
        if (building.type == LandPlotType.LandPlot) return
        if (building.type == LandPlotType.RatLair) return 
        if (building.type == LandPlotType.FarmPlot) return 
        if (building.type == LandPlotType.CottonField) return
        
        if (Math.random() > 0.9) {
            building.durability = trim(building.durability - 1, 0, 1000)
        }
    }

    export function building_repair(building: LandPlot, x: number) {
        building.durability = trim(building.durability + x, 0, 1000)
    }

    export function rest_building_tick(character: Character) {
        if (character.current_building == undefined) {
            return
        }
        let building = Data.Buildings.from_id(character.current_building)
        let tier = ScriptedValue.building_rest_tier(building.type, character)
        let fatigue_target = ScriptedValue.rest_target_fatigue(tier, building.durability, character.race())
        let stress_target = ScriptedValue.rest_target_stress(tier, building.durability, character.race())
        if (fatigue_target < character.get_fatigue()) {
            let fatigue_change = trim(-5, fatigue_target - character.get_fatigue(), 0)
            Effect.Change.fatigue(character, fatigue_change)
        }

        if (stress_target < character.get_stress()) {
            let stress_change = trim(-5, stress_target - character.get_stress(), 0)
            Effect.Change.stress(character, stress_change)
        }

        building_quality_reduction_roll(building)
    }
}