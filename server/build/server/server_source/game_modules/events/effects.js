"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Effect = void 0;
const user_manager_1 = require("../client_communication/user_manager");
const data_1 = require("../data");
const systems_communication_1 = require("../systems_communication");
const scripted_values_1 = require("./scripted_values");
const basic_functions_1 = require("../calculations/basic_functions");
var Effect;
(function (Effect) {
    let Update;
    (function (Update) {
        function cell_market(cell) {
            const locals = cell.get_characters_list();
            for (let item of locals) {
                const id = item.id;
                const local_character = systems_communication_1.Convert.id_to_character(id);
                user_manager_1.UserManagement.add_user_to_update_queue(local_character.user_id, 19 /* UI_Part.MARKET */);
            }
        }
        Update.cell_market = cell_market;
    })(Update = Effect.Update || (Effect.Update = {}));
    function change_durability(character, slot, dx) {
        const item = character.equip.slot_to_item(slot);
        if (item == undefined)
            return;
        item.durability += dx;
        if (item.durability < 1)
            destroy_item(character, slot);
        user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 3 /* UI_Part.BELONGINGS */);
    }
    Effect.change_durability = change_durability;
    function destroy_item(character, slot) {
        character.equip.destroy_slot(slot);
        user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 3 /* UI_Part.BELONGINGS */);
    }
    Effect.destroy_item = destroy_item;
    let Transfer;
    (function (Transfer) {
        function savings(from, to, x) {
            from.savings.transfer(to.savings, x);
            user_manager_1.UserManagement.add_user_to_update_queue(from.user_id, 5 /* UI_Part.SAVINGS */);
            user_manager_1.UserManagement.add_user_to_update_queue(to.user_id, 5 /* UI_Part.SAVINGS */);
        }
        Transfer.savings = savings;
    })(Transfer = Effect.Transfer || (Effect.Transfer = {}));
    let Change;
    (function (Change) {
        function fatigue(character, dx) {
            let prev = character.get_fatigue();
            character.change_fatigue(dx);
            let current = character.get_fatigue();
            let change = current - prev;
            if ((dx - change > 0)) {
                stress(character, dx - change);
            }
            user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 1 /* UI_Part.STATUS */);
        }
        Change.fatigue = fatigue;
        function stress(character, dx) {
            character.change_stress(dx);
            user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 1 /* UI_Part.STATUS */);
        }
        Change.stress = stress;
        function rage(character, dx) {
            character.change_rage(dx);
            user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 1 /* UI_Part.STATUS */);
        }
        Change.rage = rage;
        function skill(character, skill, dx) {
            character.skills[skill] += dx;
            if (character.skills[skill] > 100)
                character.skills[skill] = 100;
            user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 12 /* UI_Part.SKILLS */);
        }
        Change.skill = skill;
    })(Change = Effect.Change || (Effect.Change = {}));
    function learn_perk(student, perk) {
        student.perks[perk] = true;
        user_manager_1.UserManagement.add_user_to_update_queue(student.user_id, 12 /* UI_Part.SKILLS */);
    }
    Effect.learn_perk = learn_perk;
    function rent_room(character_id, building_id) {
        let building = data_1.Data.Buildings.from_id(building_id);
        let rooms_not_available = data_1.Data.Buildings.occupied_rooms(building_id);
        let owner_id = data_1.Data.Buildings.owner(building_id);
        let character = data_1.Data.CharacterDB.from_id(character_id);
        if (character.current_building != undefined) {
            return "you are already somewhere";
        }
        if (rooms_not_available >= building.rooms) {
            return "no_rooms";
        }
        if (owner_id == undefined) {
            character.current_building = building_id;
            data_1.Data.Buildings.occupy_room(building_id);
            return "no_owner";
        }
        let price = scripted_values_1.ScriptedValue.room_price(building_id, character_id);
        if (character.savings.get() < price) {
            return "not_enough_money";
        }
        let owner = data_1.Data.CharacterDB.from_id(owner_id);
        if (owner.cell_id != character.cell_id)
            return "invalid_cell";
        Effect.Transfer.savings(character, owner, price);
        data_1.Data.Buildings.occupy_room(building_id);
        character.current_building = building_id;
        return "ok";
    }
    Effect.rent_room = rent_room;
    function leave_room(character_id) {
        let character = data_1.Data.CharacterDB.from_id(character_id);
        if (character.current_building == undefined)
            return;
        data_1.Data.Buildings.free_room(character.current_building);
        character.current_building = undefined;
    }
    Effect.leave_room = leave_room;
    function new_building(cell_id, type, rooms, durability) {
        data_1.Data.Buildings.create({
            cell_id: cell_id,
            durability: durability,
            type: type,
            rooms: rooms,
            kitchen: 0,
            workshop: 0,
            room_cost: 5
        });
    }
    Effect.new_building = new_building;
    function building_quality_reduction_roll(building) {
        if (Math.random() > 0.9) {
            building.durability = (0, basic_functions_1.trim)(building.durability - 1, 0, 1000);
        }
    }
    Effect.building_quality_reduction_roll = building_quality_reduction_roll;
    function building_repair(building, x) {
        building.durability = (0, basic_functions_1.trim)(building.durability + x, 0, 1000);
    }
    Effect.building_repair = building_repair;
    function rest_building_tick(character) {
        if (character.current_building == undefined) {
            return;
        }
        let building = data_1.Data.Buildings.from_id(character.current_building);
        let tier = scripted_values_1.ScriptedValue.building_rest_tier(building.type, character);
        let fatigue_target = scripted_values_1.ScriptedValue.rest_target_fatigue(tier, building.durability, character.race());
        let stress_target = scripted_values_1.ScriptedValue.rest_target_stress(tier, building.durability, character.race());
        if (fatigue_target < character.get_fatigue()) {
            let fatigue_change = (0, basic_functions_1.trim)(-5, fatigue_target - character.get_fatigue(), 0);
            Effect.Change.fatigue(character, fatigue_change);
        }
        if (stress_target < character.get_stress()) {
            let stress_change = (0, basic_functions_1.trim)(-5, stress_target - character.get_stress(), 0);
            Effect.Change.stress(character, stress_change);
        }
        building_quality_reduction_roll(building);
        if ((stress_target >= character.get_fatigue()) && (stress_target >= character.get_stress())) {
            Effect.leave_room(character.id);
        }
    }
    Effect.rest_building_tick = rest_building_tick;
})(Effect = exports.Effect || (exports.Effect = {}));
