"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Effect = void 0;
const content_1 = require("../../.././../game_content/src/content");
const basic_functions_1 = require("../calculations/basic_functions");
const alerts_1 = require("../client_communication/network_actions/alerts");
const user_manager_1 = require("../client_communication/user_manager");
const data_id_1 = require("../data/data_id");
const data_objects_1 = require("../data/data_objects");
const scripted_values_1 = require("../events/scripted_values");
const triggers_1 = require("../events/triggers");
const equipment_values_1 = require("../scripted-values/equipment-values");
var Effect;
(function (Effect) {
    let Update;
    (function (Update) {
        function cell_market(cell) {
            const locals = data_id_1.DataID.Cells.local_character_id_list(cell);
            for (let item of locals) {
                const local_character = data_objects_1.Data.Characters.from_id(item);
                user_manager_1.UserManagement.add_user_to_update_queue(local_character.user_id, 23 /* UI_Part.MARKET */);
            }
        }
        Update.cell_market = cell_market;
    })(Update = Effect.Update || (Effect.Update = {}));
    function change_durability(character, slot, dx) {
        const item = equipment_values_1.EquipmentValues.item(character.equip, slot);
        if (item == undefined)
            return;
        item.durability += dx;
        if (item.durability < 1)
            destroy_item(character, slot);
        user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 7 /* UI_Part.BELONGINGS */);
    }
    Effect.change_durability = change_durability;
    function destroy_item(character, slot) {
        character.equip.destroy_slot(slot);
        user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 7 /* UI_Part.BELONGINGS */);
    }
    Effect.destroy_item = destroy_item;
    let Transfer;
    (function (Transfer) {
        function savings(from, to, x, reason) {
            from.savings.transfer(to.savings, x);
            alerts_1.Alerts.Log.savings_transfer(from, to, x, reason);
            user_manager_1.UserManagement.add_user_to_update_queue(from.user_id, 9 /* UI_Part.SAVINGS */);
            user_manager_1.UserManagement.add_user_to_update_queue(to.user_id, 9 /* UI_Part.SAVINGS */);
        }
        Transfer.savings = savings;
        function stash(A, B, what, amount, reason) {
            A.stash.transfer(B.stash, what, amount);
            alerts_1.Alerts.Log.material_transfer(A, B, what, amount, reason);
            user_manager_1.UserManagement.add_user_to_update_queue(A.user_id, 8 /* UI_Part.STASH */);
            user_manager_1.UserManagement.add_user_to_update_queue(B.user_id, 8 /* UI_Part.STASH */);
        }
        Transfer.stash = stash;
        function to_trade_stash(A, material, amount) {
            if (amount > 0) {
                if (A.stash.get(material) < amount)
                    return false;
                A.stash.transfer(A.trade_stash, material, amount);
                user_manager_1.UserManagement.add_user_to_update_queue(A.user_id, 8 /* UI_Part.STASH */);
                alerts_1.Alerts.Log.to_trade_stash(A, material, amount);
                return true;
            }
            if (amount < 0) {
                if (A.trade_stash.get(material) < -amount)
                    return false;
                A.trade_stash.transfer(A.stash, material, -amount);
                user_manager_1.UserManagement.add_user_to_update_queue(A.user_id, 8 /* UI_Part.STASH */);
                alerts_1.Alerts.Log.from_trade_stash(A, material, -amount);
                return true;
            }
            return true;
        }
        Transfer.to_trade_stash = to_trade_stash;
        function to_trade_savings(A, amount) {
            if (amount > 0) {
                if (A.savings.get() < amount)
                    return false;
                A.savings.transfer(A.trade_savings, amount);
                alerts_1.Alerts.Log.to_trade_savings(A, amount);
                return true;
            }
            if (amount < 0) {
                if (A.trade_savings.get() < -amount)
                    return false;
                A.trade_savings.transfer(A.savings, -amount);
                alerts_1.Alerts.Log.from_trade_savings(A, -amount);
                return true;
            }
            return true;
        }
        Transfer.to_trade_savings = to_trade_savings;
    })(Transfer = Effect.Transfer || (Effect.Transfer = {}));
    let Set;
    (function (Set) {
        function status(character, dstatus, reason) {
            hp(character, dstatus.hp, reason);
            rage(character, dstatus.rage, reason);
            stress(character, dstatus.stress, reason);
            blood(character, dstatus.blood, reason);
            fatigue(character, dstatus.fatigue, reason);
        }
        Set.status = status;
        function fatigue(character, x, reason) {
            if (!character._set_fatigue(x))
                return;
            alerts_1.Alerts.Log.fatigue_set(character, x, reason);
            user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 5 /* UI_Part.FATIGUE */);
        }
        Set.fatigue = fatigue;
        function stress(character, x, reason) {
            if (!character._set_stress(x))
                return;
            alerts_1.Alerts.Log.stress_set(character, x, reason);
            user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 3 /* UI_Part.STRESS */);
        }
        Set.stress = stress;
        function hp(character, x, reason) {
            if (!character._set_hp(x))
                return;
            alerts_1.Alerts.Log.hp_set(character, x, reason);
            user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 2 /* UI_Part.HP */);
        }
        Set.hp = hp;
        function rage(character, x, reason) {
            if (!character._set_rage(x))
                return;
            alerts_1.Alerts.Log.rage_set(character, x, reason);
            user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 6 /* UI_Part.RAGE */);
        }
        Set.rage = rage;
        function blood(character, x, reason) {
            if (!character._set_blood(x))
                return;
            alerts_1.Alerts.Log.blood_set(character, x, reason);
            user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 4 /* UI_Part.BLOOD */);
        }
        Set.blood = blood;
    })(Set = Effect.Set || (Effect.Set = {}));
    function transaction(A, B, savings_A_to_B, stash_A_to_B, savings_B_to_A, stash_B_to_A, reason) {
        // transaction validation
        if (A.savings.get() < savings_A_to_B)
            return false;
        if (B.savings.get() < savings_B_to_A)
            return false;
        for (let material of content_1.MaterialConfiguration.MATERIAL) {
            if (A.stash.get(material) < stash_A_to_B.get(material))
                return false;
            if (B.stash.get(material) < stash_B_to_A.get(material))
                return false;
        }
        //transaction is validated, execution
        Transfer.savings(A, B, savings_A_to_B, reason);
        Transfer.savings(B, A, savings_B_to_A, reason);
        for (let material of content_1.MaterialConfiguration.MATERIAL) {
            Transfer.stash(A, B, material, stash_A_to_B.get(material), reason);
            Transfer.stash(B, A, material, stash_B_to_A.get(material), reason);
        }
        return true;
    }
    Effect.transaction = transaction;
    let Change;
    (function (Change) {
        function status(character, dstatus, reason) {
            hp(character, dstatus.hp, reason);
            rage(character, dstatus.rage, reason);
            stress(character, dstatus.stress, reason);
            blood(character, dstatus.blood, reason);
            fatigue(character, dstatus.fatigue, reason);
        }
        Change.status = status;
        function hp(character, dx, reason) {
            if (!character._change_hp(dx))
                return;
            alerts_1.Alerts.Log.hp_change(character, dx, reason);
            user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 2 /* UI_Part.HP */);
        }
        Change.hp = hp;
        function fatigue(character, dx, reason) {
            let prev = character.get_fatigue();
            let flag = character._change_fatigue(dx);
            let current = character.get_fatigue();
            let change = current - prev;
            if ((dx - change > 0)) {
                stress(character, dx - change, reason);
            }
            if (Math.abs(change) > 0)
                alerts_1.Alerts.Log.fatigue_change(character, dx, reason);
            if (flag)
                user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 5 /* UI_Part.FATIGUE */);
        }
        Change.fatigue = fatigue;
        function stress(character, dx, reason) {
            if (!character._change_stress(dx))
                return;
            alerts_1.Alerts.Log.stress_change(character, dx, reason);
            if (Math.abs(dx) > 0)
                user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 3 /* UI_Part.STRESS */);
        }
        Change.stress = stress;
        function rage(character, dx, reason) {
            if (!character._change_rage(dx))
                return;
            alerts_1.Alerts.Log.rage_change(character, dx, reason);
            if (Math.abs(dx) > 0)
                user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 6 /* UI_Part.RAGE */);
        }
        Change.rage = rage;
        function blood(character, dx, reason) {
            if (!character._change_blood(dx))
                return;
            alerts_1.Alerts.Log.blood_change(character, dx, reason);
            if (Math.abs(dx) > 0)
                user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 4 /* UI_Part.BLOOD */);
        }
        Change.blood = blood;
        function skill(character, skill, dx, reason) {
            character._skills[skill] += dx;
            if (character._skills[skill] > 100)
                character._skills[skill] = 100;
            else
                alerts_1.Alerts.Log.skill_change(character, skill, dx, reason);
            if (Math.abs(dx) > 0)
                user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 16 /* UI_Part.SKILLS */);
        }
        Change.skill = skill;
    })(Change = Effect.Change || (Effect.Change = {}));
    function learn_perk(student, perk) {
        student._perks[perk] = true;
        user_manager_1.UserManagement.add_user_to_update_queue(student.user_id, 16 /* UI_Part.SKILLS */);
    }
    Effect.learn_perk = learn_perk;
    function enter_location(character_id, location_id) {
        let character = data_objects_1.Data.Characters.from_id(character_id);
        let response = triggers_1.Trigger.location_is_available(character_id, location_id);
        if (response.response == 'ok') {
            _enter_location(character_id, location_id);
        }
        return response;
    }
    Effect.enter_location = enter_location;
    function _enter_location(character_id, location_id) {
        let character = data_objects_1.Data.Characters.from_id(character_id);
        character.location_id = location_id;
        //console.log("???")
        user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 12 /* UI_Part.MAP_POSITION */);
    }
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
    function spoilage(character, good, rate) {
        let dice = Math.random();
        if (dice < rate) {
            let current_amount = character.stash.get(good);
            let integer = (Math.random() < 0.5) ? 1 : 0;
            let spoiled_amount = Math.max(integer, Math.floor(current_amount * rate));
            alerts_1.Alerts.Log.stash_change(character, good, -spoiled_amount, "Spoilage" /* CHANGE_REASON.SPOILAGE */);
            character.stash.set(good, current_amount - spoiled_amount);
            user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 8 /* UI_Part.STASH */);
        }
    }
    Effect.spoilage = spoilage;
})(Effect || (exports.Effect = Effect = {}));

