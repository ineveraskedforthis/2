"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Alerts = void 0;
const system_1 = require("../../battle/system");
const systems_communication_1 = require("../../systems_communication");
const user_manager_1 = require("../user_manager");
const data_id_1 = require("../../data/data_id");
const data_objects_1 = require("../../data/data_objects");
const content_1 = require("../../../.././../game_content/src/content");
var Alerts;
(function (Alerts) {
    function not_enough_to_user(user, tag, current, min, max) {
        generic_user_alert(user, 'not_enough', { tag: tag, min: min, max: max, cur: current });
    }
    Alerts.not_enough_to_user = not_enough_to_user;
    function market_data(user, data) {
        generic_user_alert(user, 'market-data', data);
    }
    Alerts.market_data = market_data;
    function item_market_data(user, data) {
        generic_user_alert(user, 'item-market-data', data);
    }
    Alerts.item_market_data = item_market_data;
    function alert(character, msg) {
        generic_character_alert(character, 'alert', msg);
    }
    Alerts.alert = alert;
    function in_battle(user) {
        generic_user_alert(user, 'alert', 'you are in battle');
    }
    Alerts.in_battle = in_battle;
    function character_removed(user) {
        generic_user_alert(user, 'char-removed', undefined);
    }
    Alerts.character_removed = character_removed;
    function ok(user) {
        generic_user_alert(user, 'alert', 'ok');
    }
    Alerts.ok = ok;
    function impossible_move(user) {
        generic_user_alert(user, 'alert', 'can\'t go there');
    }
    Alerts.impossible_move = impossible_move;
    function failed(character) {
        generic_character_alert(character, 'alert', 'failed');
    }
    Alerts.failed = failed;
    function no_character(user) {
        generic_user_alert(user, 'no-character', '');
    }
    Alerts.no_character = no_character;
    function log_to_user(user, message) {
        user.socket.emit('log-message', message);
    }
    Alerts.log_to_user = log_to_user;
    function log_to_character(character, message) {
        generic_character_alert(character, 'log-message', message);
    }
    Alerts.log_to_character = log_to_character;
    function log_attack(character, attack, resistance, total_damage, role) {
        generic_character_alert(character, 'log-attack', {
            attack: attack,
            res: resistance,
            total: total_damage,
            role: role
        });
    }
    Alerts.log_attack = log_attack;
    function login_is_completed(user) {
        user.socket.emit('is-login-completed', 'ok');
    }
    Alerts.login_is_completed = login_is_completed;
    function not_enough_to_character(character, tag, current, min, max) {
        let user = systems_communication_1.Convert.character_to_user(character);
        if (user == undefined)
            return;
        not_enough_to_user(user, tag, current, min, max);
    }
    Alerts.not_enough_to_character = not_enough_to_character;
    function generic_user_alert(user, tag, msg) {
        if (!user.logged_in)
            return;
        user.socket.emit(tag, msg);
    }
    Alerts.generic_user_alert = generic_user_alert;
    function battle_progress(user, flag) {
        if (user == undefined)
            return;
        if (!user.logged_in)
            return;
        user.socket.emit('battle-in-process', flag);
    }
    Alerts.battle_progress = battle_progress;
    function generic_character_alert(character, tag, msg) {
        let user = systems_communication_1.Convert.character_to_user(character);
        if (user == undefined)
            return;
        generic_user_alert(user, tag, msg);
    }
    Alerts.generic_character_alert = generic_character_alert;
    function craft_bulk(user, tag, value) {
        for (let item of value) {
            Alerts.generic_user_alert(user, `val_${tag}_craft_output_${item.material}_c`, item.amount);
        }
    }
    Alerts.craft_bulk = craft_bulk;
    function craft_bulk_complete(user, tag, value) {
        Alerts.generic_user_alert(user, 'craft-bulk-complete', { tag: tag, value: value });
    }
    Alerts.craft_bulk_complete = craft_bulk_complete;
    function craft_item(user, tag, value) {
        Alerts.generic_user_alert(user, `val_${tag}_craft_durability_c`, value);
    }
    Alerts.craft_item = craft_item;
    function craft_item_complete(user, tag, value) {
        Alerts.generic_user_alert(user, 'craft-item-complete', { tag: tag, value: value });
    }
    Alerts.craft_item_complete = craft_item_complete;
    function skill(user, tag, pure_value, current_value) {
        Alerts.generic_user_alert(user, `val_${tag}_c`, current_value);
    }
    Alerts.skill = skill;
    function battle_action_chance(user, tag, value) {
        Alerts.generic_user_alert(user, 'b-action-chance', { tag: tag, value: value });
    }
    Alerts.battle_action_chance = battle_action_chance;
    function battle_action_damage(user, tag, value) {
        Alerts.generic_user_alert(user, 'b-action-damage', { tag: tag, value: value });
    }
    Alerts.battle_action_damage = battle_action_damage;
    function battle_event_target_unit(battle, tag, unit, target) {
        battle.last_event_index += 1;
        const actor_data = systems_communication_1.Convert.unit_to_unit_socket(unit);
        actor_data.action = {
            action: tag,
            target: target.id,
            type: "unit"
        };
        const target_data = systems_communication_1.Convert.unit_to_unit_socket(target);
        const event = {
            index: battle.last_event_index,
            data: [
                actor_data, target_data
            ]
        };
        battle.battle_history[event.index] = event;
        for (let unit_id of Object.values(battle.heap)) {
            if (unit_id == undefined)
                continue;
            const unit = data_objects_1.Data.Characters.from_id(unit_id);
            generic_character_alert(unit, 'battle-event', event);
        }
    }
    Alerts.battle_event_target_unit = battle_event_target_unit;
    function battle_event_simple(battle, tag, unit) {
        battle.last_event_index += 1;
        const actor_data = systems_communication_1.Convert.unit_to_unit_socket(unit);
        actor_data.action = {
            action: tag,
            target: unit.id,
            type: "unit"
        };
        const event = {
            index: battle.last_event_index,
            data: [
                actor_data
            ]
        };
        battle.battle_history[event.index] = event;
        for (let unit of battle.heap) {
            if (unit == undefined)
                continue;
            const character = data_objects_1.Data.Characters.from_id(unit);
            generic_character_alert(character, 'battle-event', event);
        }
    }
    Alerts.battle_event_simple = battle_event_simple;
    function battle_event_target_position(battle, tag, unit, position) {
        battle.last_event_index += 1;
        const actor_data = systems_communication_1.Convert.unit_to_unit_socket(unit);
        actor_data.action = {
            action: tag,
            target: position,
            type: "position"
        };
        const event = {
            index: battle.last_event_index,
            data: [
                actor_data
            ]
        };
        battle.battle_history[event.index] = event;
        for (let unit of battle.heap) {
            if (unit == undefined)
                continue;
            const character = data_objects_1.Data.Characters.from_id(unit);
            generic_character_alert(character, 'battle-event', event);
        }
    }
    Alerts.battle_event_target_position = battle_event_target_position;
    function battle_update_units(battle) {
        for (let unit of battle.heap) {
            if (unit == undefined)
                continue;
            Alerts.battle_event_simple(battle, 'update', data_objects_1.Data.Characters.from_id(unit));
        }
    }
    Alerts.battle_update_units = battle_update_units;
    function battle_update_unit(battle, unit) {
        Alerts.battle_event_simple(battle, 'update', unit);
    }
    Alerts.battle_update_unit = battle_update_unit;
    function battle_to_character(battle, character) {
        const data = system_1.BattleSystem.data(battle);
        generic_character_alert(character, 'battle-update-units', data);
    }
    Alerts.battle_to_character = battle_to_character;
    function new_unit(battle, new_unit) {
        for (let unit of battle.heap) {
            if (unit == undefined)
                continue;
            const character = data_objects_1.Data.Characters.from_id(unit);
            generic_character_alert(character, 'battle-new-unit', systems_communication_1.Convert.unit_to_unit_socket(new_unit));
        }
    }
    Alerts.new_unit = new_unit;
    function new_queuer(battle, new_unit, delay) {
        for (let unit of battle.heap) {
            if (unit == undefined)
                continue;
            const character = data_objects_1.Data.Characters.from_id(unit);
            Alerts.alert(character, new_unit.get_name() + " will join the battle in " + delay + " units of time");
        }
    }
    Alerts.new_queuer = new_queuer;
    function remove_unit(battle, removed_unit) {
        for (let unit of battle.heap) {
            if (unit == undefined)
                continue;
            const character = data_objects_1.Data.Characters.from_id(unit);
            generic_character_alert(character, 'battle-remove-unit', removed_unit.id);
        }
    }
    Alerts.remove_unit = remove_unit;
    function cell_locals(cell) {
        const locals = data_id_1.DataID.Cells.local_character_id_list(cell);
        for (let item of locals) {
            // const id = item.id
            const local_character = data_objects_1.Data.Characters.from_id(item);
            const local_user = systems_communication_1.Convert.character_to_user(local_character);
            if (local_user == undefined) {
                continue;
            }
            user_manager_1.UserManagement.add_user_to_update_queue(local_user.data.id, 13 /* UI_Part.LOCAL_CHARACTERS */);
        }
    }
    Alerts.cell_locals = cell_locals;
    function action_ping(character, duration, is_move) {
        generic_character_alert(character, 'action-ping', { tag: 'start', time: duration, is_move: is_move });
    }
    Alerts.action_ping = action_ping;
    function perks(user, character) {
        Alerts.generic_user_alert(user, 'perks-update', character._perks);
    }
    Alerts.perks = perks;
    function traits(user, character) {
        Alerts.generic_user_alert(user, 'traits-update', character._traits);
    }
    Alerts.traits = traits;
    function enter_room(character) {
        Alerts.generic_character_alert(character, 'enter-room', character);
    }
    Alerts.enter_room = enter_room;
    function leave_room(character) {
        Alerts.generic_character_alert(character, 'leave-room', character);
    }
    Alerts.leave_room = leave_room;
    let Log;
    (function (Log) {
        function to_trade_stash(A, material, amount) {
            Alerts.log_to_character(A, `You moved ${amount} of ${content_1.MaterialStorage.get(material).name} to your trade stash. Cancel your market order to return it back.`);
        }
        Log.to_trade_stash = to_trade_stash;
        function from_trade_stash(A, material, amount) {
            Alerts.log_to_character(A, `You moved ${amount} of ${content_1.MaterialStorage.get(material).name} from your trade stash.`);
        }
        Log.from_trade_stash = from_trade_stash;
        function to_trade_savings(A, amount) {
            Alerts.log_to_character(A, `You moved ${amount} money to your trade savings. Cancel your market order to return it back.`);
        }
        Log.to_trade_savings = to_trade_savings;
        function from_trade_savings(A, amount) {
            Alerts.log_to_character(A, `You moved ${amount} money from your trade savings.`);
        }
        Log.from_trade_savings = from_trade_savings;
        function savings_transfer(from, to, amount, reason) {
            Alerts.log_to_character(from, `You transfered ${amount} money to ${to.name}(${to.id}). Reason:${reason}`);
            Alerts.log_to_character(to, `You got ${amount} money from ${from.name}(${to.id}). Reason:${reason}`);
        }
        Log.savings_transfer = savings_transfer;
        function stash_transfer(from, to, transfer, reason) {
            for (const m of content_1.MaterialConfiguration.MATERIAL) {
                const amount = transfer.get(m);
                material_transfer(from, to, m, amount, reason);
            }
        }
        Log.stash_transfer = stash_transfer;
        function material_transfer(from, to, what, amount, reason) {
            if (amount == 0)
                return;
            Alerts.log_to_character(from, `You transfered ${amount} of ${content_1.MaterialStorage.get(what).name} to ${to.name}(${to.id}). Reason:${reason}`);
            Alerts.log_to_character(to, `You got ${amount} of ${content_1.MaterialStorage.get(what).name} from ${from.name}(${to.id}). Reason:${reason}`);
        }
        Log.material_transfer = material_transfer;
        function stash_change(character, what, amount, reason) {
            if (amount == 0)
                return;
            Alerts.log_to_character(character, `Your stash of ${content_1.MaterialStorage.get(what).name} changed by ${amount}. Reason:${reason}`);
        }
        Log.stash_change = stash_change;
        function hp_change(character, d, reason) {
            Alerts.log_to_character(character, `Your hp changed by ${d}. Reason: ${reason}`);
        }
        Log.hp_change = hp_change;
        function stress_change(character, d, reason) {
            Alerts.log_to_character(character, `Your stress changed by ${d}. Reason: ${reason}`);
        }
        Log.stress_change = stress_change;
        function fatigue_change(character, d, reason) {
            Alerts.log_to_character(character, `Your fatigue changed by ${d}. Reason: ${reason}`);
        }
        Log.fatigue_change = fatigue_change;
        function blood_change(character, d, reason) {
            Alerts.log_to_character(character, `Your blood changed by ${d}. Reason: ${reason}`);
        }
        Log.blood_change = blood_change;
        function rage_change(character, d, reason) {
            Alerts.log_to_character(character, `Your rage changed by ${d}. Reason: ${reason}`);
        }
        Log.rage_change = rage_change;
        function hp_set(character, d, reason) {
            Alerts.log_to_character(character, `Your hp was set to ${d}. Reason: ${reason}`);
        }
        Log.hp_set = hp_set;
        function stress_set(character, d, reason) {
            Alerts.log_to_character(character, `Your stress was set to ${d}. Reason: ${reason}`);
        }
        Log.stress_set = stress_set;
        function fatigue_set(character, d, reason) {
            Alerts.log_to_character(character, `Your fatigue was set to ${d}. Reason: ${reason}`);
        }
        Log.fatigue_set = fatigue_set;
        function blood_set(character, d, reason) {
            Alerts.log_to_character(character, `Your blood was set to ${d}. Reason: ${reason}`);
        }
        Log.blood_set = blood_set;
        function rage_set(character, d, reason) {
            Alerts.log_to_character(character, `Your rage was set to ${d}. Reason: ${reason}`);
        }
        Log.rage_set = rage_set;
        function skill_change(character, skill, d, reason) {
            Alerts.log_to_character(character, `Your ${skill} skill changed by ${d}. Reason: ${reason}`);
        }
        Log.skill_change = skill_change;
    })(Log = Alerts.Log || (Alerts.Log = {}));
})(Alerts || (exports.Alerts = Alerts = {}));

