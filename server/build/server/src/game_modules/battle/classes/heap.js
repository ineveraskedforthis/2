"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CharactersHeap = void 0;
const data_objects_1 = require("../../data/data_objects");
/**  Implementation of priority queue to decide priority in battle
* Current unit is stored in heap[0]
* To end turn, use .pop to delete current unit, reset it and then .push it back
* If current unit is '?', then priority queue is empty and battle should be stopped
* TODO: separate heap logic into separate namespace
*/
var CharactersHeap;
(function (CharactersHeap) {
    function populate_battle(battle, raw_data) {
        battle.heap = [];
        battle.last = 0;
        for (let character_id of raw_data) {
            const unit = data_objects_1.Data.Characters.from_id(character_id);
            add_unit(battle, unit);
        }
    }
    CharactersHeap.populate_battle = populate_battle;
    function get_value(battle, i) {
        const id = battle.heap[i];
        const unit = data_objects_1.Data.Characters.from_id(id);
        if (unit == undefined)
            return 9999;
        return unit.next_turn_after;
    }
    CharactersHeap.get_value = get_value;
    function get_max(battle) {
        let max = 0;
        battle.heap.map(data_objects_1.Data.Characters.from_id).forEach((unit) => {
            if (unit == undefined)
                return;
            if (unit.next_turn_after > max) {
                max = unit.next_turn_after;
            }
        });
        for (const item of battle.queue) {
            if (max < item.delay)
                max = item.delay;
        }
        return max;
    }
    CharactersHeap.get_max = get_max;
    function get_units_amount(battle) {
        return battle.last;
    }
    CharactersHeap.get_units_amount = get_units_amount;
    function get_unit(battle, i) {
        return data_objects_1.Data.Characters.from_id(i);
    }
    CharactersHeap.get_unit = get_unit;
    function get_selected_unit(battle) {
        if (battle.last == 0)
            return undefined;
        const current = battle.heap[0];
        if (current == undefined)
            return undefined;
        return get_unit(battle, current);
    }
    CharactersHeap.get_selected_unit = get_selected_unit;
    function delete_unit(battle, x) {
        var position = undefined;
        for (let i = 0; i < battle.last; i++) {
            if (battle.heap[i] == x.id)
                position = i;
        }
        if (position == undefined)
            return false;
        battle.last -= 1;
        battle.heap[position] = battle.heap[battle.last];
        shift_down(battle, position);
        x.battle_id = undefined;
        battle.heap.splice(battle.last, 1);
        return true;
    }
    CharactersHeap.delete_unit = delete_unit;
    function push(battle, obj) {
        battle.heap[battle.last] = obj;
        battle.last += 1;
        shift_up(battle, battle.last - 1);
    }
    CharactersHeap.push = push;
    function shift_up(battle, i) {
        let tmp = i;
        while ((tmp > 0) && (get_value(battle, tmp) < get_value(battle, Math.floor((tmp - 1) / 2)))) {
            swap(battle, tmp, Math.floor((tmp - 1) / 2));
            tmp = Math.floor((tmp - 1) / 2);
        }
    }
    CharactersHeap.shift_up = shift_up;
    function shift_down(battle, i) {
        let tmp = i;
        while (tmp * 2 + 1 < battle.last) {
            if (tmp * 2 + 2 < battle.last) {
                if ((get_value(battle, tmp * 2 + 2) < get_value(battle, tmp * 2 + 1)) && (get_value(battle, tmp * 2 + 2) < get_value(battle, tmp))) {
                    swap(battle, tmp, tmp * 2 + 2);
                    tmp = tmp * 2 + 2;
                }
                else if (get_value(battle, tmp * 2 + 1) < get_value(battle, tmp)) {
                    swap(battle, tmp, tmp * 2 + 1);
                    tmp = tmp * 2 + 1;
                }
                else {
                    break;
                }
            }
            else if (get_value(battle, tmp * 2 + 1) < get_value(battle, tmp)) {
                swap(battle, tmp, tmp * 2 + 1);
                tmp = tmp * 2 + 1;
            }
            else {
                break;
            }
        }
    }
    CharactersHeap.shift_down = shift_down;
    function add_unit(battle, u) {
        push(battle, u.id);
    }
    CharactersHeap.add_unit = add_unit;
    function swap(battle, a, b) {
        let s = battle.heap[a];
        battle.heap[a] = battle.heap[b];
        battle.heap[b] = s;
    }
    CharactersHeap.swap = swap;
    function pop(battle) {
        if (battle.last == 0) {
            return undefined;
        }
        let tmp = battle.heap[0];
        battle.last -= 1;
        battle.heap[0] = battle.heap[battle.last];
        battle.heap.length = battle.last;
        shift_down(battle, 0);
        return tmp;
    }
    CharactersHeap.pop = pop;
    function update(battle, dt) {
        for (let i = 0; i < battle.last; i++) {
            const id = battle.heap[i];
            if (id == undefined)
                continue;
            const unit = data_objects_1.Data.Characters.from_id(id);
            unit.next_turn_after = unit.next_turn_after - dt;
        }
        const to_join = [];
        const response = [];
        for (let index = 0; index < battle.queue.length; index++) {
            battle.queue[index].delay -= dt;
            if (battle.queue[index].delay < 0)
                to_join.push(index);
        }
        for (const index of to_join) {
            const unit = battle.queue[index];
            battle.queue.splice(index, 1);
            add_unit(battle, data_objects_1.Data.Characters.from_id(unit.character));
            response.push(unit.character);
        }
        return response;
    }
    CharactersHeap.update = update;
})(CharactersHeap || (exports.CharactersHeap = CharactersHeap = {}));
