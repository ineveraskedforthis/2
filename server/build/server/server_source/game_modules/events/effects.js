"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Effect = void 0;
const user_manager_1 = require("../client_communication/user_manager");
const scripted_values_1 = require("./scripted_values");
const basic_functions_1 = require("../calculations/basic_functions");
const triggers_1 = require("./triggers");
const system_1 = require("../market/system");
const data_id_1 = require("../data/data_id");
const data_objects_1 = require("../data/data_objects");
var Effect;
(function (Effect) {
    let Update;
    (function (Update) {
        function cell_market(cell) {
            const locals = data_id_1.DataID.Cells.local_character_id_list(cell);
            for (let item of locals) {
                const local_character = data_objects_1.Data.Characters.from_id(item);
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
        function hp(character, dx) {
            if (!character.change_hp(dx))
                return;
            if (Math.abs(dx) > 0)
                user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 1 /* UI_Part.STATUS */);
        }
        Change.hp = hp;
        function fatigue(character, dx) {
            let prev = character.get_fatigue();
            let flag = character.change_fatigue(dx);
            let current = character.get_fatigue();
            let change = current - prev;
            if ((dx - change > 0)) {
                stress(character, dx - change);
            }
            if (Math.abs(dx) > 0)
                if (!flag)
                    user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 1 /* UI_Part.STATUS */);
        }
        Change.fatigue = fatigue;
        function stress(character, dx) {
            if (!character.change_stress(dx))
                return;
            if (Math.abs(dx) > 0)
                user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 1 /* UI_Part.STATUS */);
        }
        Change.stress = stress;
        function rage(character, dx) {
            if (!character.change_rage(dx))
                return;
            if (Math.abs(dx) > 0)
                user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 1 /* UI_Part.STATUS */);
        }
        Change.rage = rage;
        function blood(character, dx) {
            if (!character.change_blood(dx))
                return;
            if (Math.abs(dx) > 0)
                user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 1 /* UI_Part.STATUS */);
        }
        Change.blood = blood;
        function skill(character, skill, dx) {
            character._skills[skill] += dx;
            if (character._skills[skill] > 100)
                character._skills[skill] = 100;
            if (Math.abs(dx) > 0)
                user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 12 /* UI_Part.SKILLS */);
        }
        Change.skill = skill;
    })(Change = Effect.Change || (Effect.Change = {}));
    function learn_perk(student, perk) {
        student._perks[perk] = true;
        user_manager_1.UserManagement.add_user_to_update_queue(student.user_id, 12 /* UI_Part.SKILLS */);
    }
    Effect.learn_perk = learn_perk;
    function enter_location_payment(character_id, location_id) {
        let character = data_objects_1.Data.Characters.from_id(character_id);
        let response = triggers_1.Trigger.location_is_available(character_id, location_id);
        if (response.response == 'ok') {
            if (response.price > character.savings.data) {
                return response;
            }
            if (response.owner_id != undefined) {
                const owner = data_objects_1.Data.Characters.from_id(response.owner_id);
                Effect.Transfer.savings(character, owner, response.price);
            }
            enter_location(character_id, location_id);
        }
        return response;
    }
    Effect.enter_location_payment = enter_location_payment;
    function enter_location(character_id, location_id) {
        let character = data_objects_1.Data.Characters.from_id(character_id);
        character.location_id = location_id;
        //console.log("???")
        user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 8 /* UI_Part.MAP_POSITION */);
    }
    Effect.enter_location = enter_location;
    function location_quality_reduction_roll(location) {
        if (location.has_house_level == 0)
            return;
        if (Math.random() > 0.9) {
            location.devastation = (0, basic_functions_1.trim)(location.devastation + 1, 0, scripted_values_1.ScriptedValue.max_devastation);
        }
    }
    Effect.location_quality_reduction_roll = location_quality_reduction_roll;
    function location_repair(location, x) {
        location.devastation = (0, basic_functions_1.trim)(location.devastation - x, 0, scripted_values_1.ScriptedValue.max_devastation);
    }
    Effect.location_repair = location_repair;
    function rest_location_tick(character) {
        let location = data_objects_1.Data.Locations.from_id(character.location_id);
        let tier = location.has_house_level;
        let fatigue_target = scripted_values_1.ScriptedValue.rest_target_fatigue(tier, scripted_values_1.ScriptedValue.max_devastation - location.devastation, character.race);
        let stress_target = scripted_values_1.ScriptedValue.rest_target_stress(tier, scripted_values_1.ScriptedValue.max_devastation - location.devastation, character.race);
        if (fatigue_target < character.get_fatigue()) {
            let fatigue_change = (0, basic_functions_1.trim)(-5, fatigue_target - character.get_fatigue(), 0);
            Effect.Change.fatigue(character, fatigue_change);
        }
        if (stress_target < character.get_stress()) {
            let stress_change = (0, basic_functions_1.trim)(-5, stress_target - character.get_stress(), 0);
            Effect.Change.stress(character, stress_change);
        }
        location_quality_reduction_roll(location);
    }
    Effect.rest_location_tick = rest_location_tick;
    function spoilage(character, good, rate) {
        let dice = Math.random();
        if (dice < rate) {
            let current_amount = character.stash.get(good);
            let integer = (Math.random() < 0.5) ? 1 : 0;
            let spoiled_amount = Math.max(integer, Math.floor(current_amount * rate));
            character.stash.set(good, current_amount - spoiled_amount);
            user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 4 /* UI_Part.STASH */);
            let orders = data_id_1.DataID.Character.market_orders_list(character.id);
            for (let order of orders) {
                let order_item = data_objects_1.Data.MarketOrders.from_id(order);
                const current_amount = order_item.amount;
                if (order_item.material != good)
                    continue;
                let spoiled_amount = Math.min(current_amount, Math.max(integer, Math.floor(current_amount * 0.01)));
                system_1.MarketOrders.decrease_amount(order, spoiled_amount);
            }
            Update.cell_market(character.cell_id);
        }
    }
    Effect.spoilage = spoilage;
})(Effect = exports.Effect || (exports.Effect = {}));
