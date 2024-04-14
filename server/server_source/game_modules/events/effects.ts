import { Character } from "../character/character";
import { UI_Part } from "../client_communication/causality_graph";
import { UserManagement } from "../client_communication/user_manager";
import { location_id, character_id } from "@custom_types/ids";
import { ScriptedValue } from "./scripted_values";
import { trim } from "../calculations/basic_functions";
import { money } from "@custom_types/common";
import { cell_id } from "@custom_types/ids";
import { Trigger } from "./triggers";
import { skill } from "@custom_types/inventory";
import { MarketOrders } from "../market/system";
import { Perks } from "@custom_types/character";
import { DataID } from "../data/data_id";
import { Data } from "../data/data_objects";
import { LocationInterface } from "../location/location_interface";
import { EQUIP_SLOT, MATERIAL } from "@content/content";

export namespace Effect {
    export namespace Update {
        export function cell_market(cell: cell_id) {
            const locals = DataID.Cells.local_character_id_list(cell)
            for (let item of locals) {
                const local_character = Data.Characters.from_id(item)
                UserManagement.add_user_to_update_queue(local_character.user_id, UI_Part.MARKET)
            }
        }
    }

    export function change_durability(character: Character, slot: EQUIP_SLOT, dx: number) {
        const item = character.equip.slot_to_item(slot)
        if (item == undefined) return
        item.durability += dx

        if (item.durability < 1) destroy_item(character, slot)

        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.BELONGINGS)
    }

    export function destroy_item(character:Character, slot: EQUIP_SLOT) {
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
        export function hp(character: Character, dx: number) {
            if (!character.change_hp(dx)) return;
            if (Math.abs(dx) > 0) UserManagement.add_user_to_update_queue(character.user_id, UI_Part.STATUS);
        }

        export function fatigue(character: Character, dx: number) {
            let prev = character.get_fatigue()
            let flag = character.change_fatigue(dx)
            let current = character.get_fatigue()
            let change = current - prev
            if ((dx - change > 0)) {
                stress(character, dx - change)
            }

            if (Math.abs(dx) > 0) if (!flag) UserManagement.add_user_to_update_queue(character.user_id, UI_Part.STATUS)
        }

        export function stress(character: Character, dx: number) {
            if (!character.change_stress(dx)) return;
            if (Math.abs(dx) > 0) UserManagement.add_user_to_update_queue(character.user_id, UI_Part.STATUS)
        }

        export function rage(character: Character, dx: number) {
            if (!character.change_rage(dx)) return;
            if (Math.abs(dx) > 0) UserManagement.add_user_to_update_queue(character.user_id, UI_Part.STATUS)
        }

        export function blood(character: Character, dx: number) {
            if (!character.change_blood(dx)) return;
            if (Math.abs(dx) > 0) UserManagement.add_user_to_update_queue(character.user_id, UI_Part.STATUS)
        }

        export function skill(character: Character, skill: skill, dx: number) {
            character._skills[skill] += dx
            if (character._skills[skill] > 100)
                character._skills[skill] = 100

            if (Math.abs(dx) > 0) UserManagement.add_user_to_update_queue(character.user_id, UI_Part.SKILLS)
        }
    }

    export function learn_perk(student: Character, perk: Perks){
        student._perks[perk] = true
        UserManagement.add_user_to_update_queue(student.user_id, UI_Part.SKILLS)
    }

    export function enter_location(character_id: character_id, location_id: location_id) {
        let character = Data.Characters.from_id(character_id)
        let response = Trigger.location_is_available(character_id, location_id)
        if (response.response == 'ok') {
            _enter_location(character_id, location_id)
        }
        return response
    }

    function _enter_location(character_id: character_id, location_id: location_id) {
        let character = Data.Characters.from_id(character_id)
        character.location_id = location_id

        //console.log("???")

        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.MAP_POSITION)
    }

    export function location_quality_reduction_roll(location: LocationInterface) {
        if (location.has_house_level == 0) return;
        if (Math.random() > 0.9) {
            location.devastation = trim(location.devastation + 1, 0, ScriptedValue.max_devastation)
        }
    }

    export function location_repair(location: LocationInterface, x: number) {
        location.devastation = trim(location.devastation - x, 0, ScriptedValue.max_devastation)
    }

    export function rest_location_tick(character: Character) {
        let location = Data.Locations.from_id(character.location_id)
        let tier = location.has_house_level
        let fatigue_target = ScriptedValue.rest_target_fatigue(tier, ScriptedValue.max_devastation - location.devastation, character.race)
        let stress_target = ScriptedValue.rest_target_stress(tier, ScriptedValue.max_devastation - location.devastation, character.race)
        if (fatigue_target < character.get_fatigue()) {
            let fatigue_change = trim(-5, fatigue_target - character.get_fatigue(), 0)
            Effect.Change.fatigue(character, fatigue_change)
        }

        if (stress_target < character.get_stress()) {
            let stress_change = trim(-5, stress_target - character.get_stress(), 0)
            Effect.Change.stress(character, stress_change)
        }

        location_quality_reduction_roll(location)
    }

    export function spoilage(character: Character, good: MATERIAL, rate: number) {
        let dice = Math.random()
        if (dice < rate) {
            let current_amount = character.stash.get(good)
            let integer = (Math.random() < 0.5) ? 1 : 0
            let spoiled_amount = Math.max(integer, Math.floor(current_amount * rate))
            character.stash.set(good, current_amount - spoiled_amount)
            UserManagement.add_user_to_update_queue(character.user_id, UI_Part.STASH)
            let orders = DataID.Character.market_orders_list(character.id)
            for (let order of orders) {
                let order_item = Data.MarketOrders.from_id(order)
                const current_amount = order_item.amount
                if (order_item.material != good) continue
                let spoiled_amount = Math.min(current_amount, Math.max(integer, Math.floor(current_amount * 0.01)))
                MarketOrders.decrease_amount(order, spoiled_amount)
            }
            Update.cell_market(character.cell_id)
        }
    }


}