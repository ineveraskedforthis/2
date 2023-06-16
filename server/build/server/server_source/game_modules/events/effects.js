"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Effect = void 0;
const user_manager_1 = require("../client_communication/user_manager");
const data_1 = require("../data");
const systems_communication_1 = require("../systems_communication");
const scripted_values_1 = require("./scripted_values");
const basic_functions_1 = require("../calculations/basic_functions");
const alerts_1 = require("../client_communication/network_actions/alerts");
const triggers_1 = require("./triggers");
var Effect;
(function (Effect) {
    let Update;
    (function (Update) {
        function cell_market(cell) {
            const locals = data_1.Data.Cells.get_characters_list_from_cell(cell);
            for (let item of locals) {
                const local_character = systems_communication_1.Convert.id_to_character(item);
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
            character._skills[skill] += dx;
            if (character._skills[skill] > 100)
                character._skills[skill] = 100;
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
        let character = data_1.Data.CharacterDB.from_id(character_id);
        let response = triggers_1.Trigger.building_is_available(character_id, building_id);
        if (response.response == 'ok') {
            if (response.owner_id != undefined) {
                const owner = data_1.Data.CharacterDB.from_id(response.owner_id);
                Effect.Transfer.savings(character, owner, response.price);
            }
            enter_room(character_id, building_id);
        }
        return response;
    }
    Effect.rent_room = rent_room;
    function enter_room(character_id, building_id) {
        Effect.leave_room(character_id);
        let character = data_1.Data.CharacterDB.from_id(character_id);
        data_1.Data.Buildings.occupy_room(building_id);
        character.current_building = building_id;
        alerts_1.Alerts.enter_room(character);
    }
    Effect.enter_room = enter_room;
    function leave_room(character_id) {
        let character = data_1.Data.CharacterDB.from_id(character_id);
        if (character.current_building == undefined)
            return;
        data_1.Data.Buildings.free_room(character.current_building);
        alerts_1.Alerts.leave_room(character);
        character.current_building = undefined;
    }
    Effect.leave_room = leave_room;
    function new_building(cell_id, type, durability, room_cost) {
        return data_1.Data.Buildings.create({
            cell_id: cell_id,
            durability: durability,
            type: type,
            room_cost: room_cost
        });
    }
    Effect.new_building = new_building;
    function building_quality_reduction_roll(building) {
        if (building.type == "forest_plot" /* LandPlotType.ForestPlot */)
            return;
        if (building.type == "land_plot" /* LandPlotType.LandPlot */)
            return;
        if (building.type == "rat_lair" /* LandPlotType.RatLair */)
            return;
        if (building.type == "farm_plot" /* LandPlotType.FarmPlot */)
            return;
        if (building.type == "cotton_field" /* LandPlotType.CottonField */)
            return;
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
    }
    Effect.rest_building_tick = rest_building_tick;
})(Effect = exports.Effect || (exports.Effect = {}));
