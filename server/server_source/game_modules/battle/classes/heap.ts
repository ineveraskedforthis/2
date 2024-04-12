
import { character_id } from "@custom_types/common";
import { DataID } from "../../data/data_id";
import { Data } from "../../data/data_objects";
import { Battle } from "./battle";
import { Character } from "../../character/character";

/**  Implementation of priority queue to decide priority in battle
* Current unit is stored in heap[0]
* To end turn, use .pop to delete current unit, reset it and then .push it back
* If current unit is '?', then priority queue is empty and battle should be stopped
* TODO: separate heap logic into separate namespace
*/
export namespace CharactersHeap {

    export function populate_battle(battle: Battle, raw_data: character_id[]) {
        battle.heap = []
        battle.last = 0;
        for (let character_id of raw_data) {
            const unit = Data.Characters.from_id(character_id)
            add_unit(battle, unit)
        }
    }

    export function get_value(battle: Battle, i: number) {
        const id = battle.heap[i]
        const unit = Data.Characters.from_id(id)
        if (unit == undefined) return 9999
        return unit.next_turn_after;
    }

    export function get_max(battle: Battle, ): number {
        let max = 0
        battle.heap.map(Data.Characters.from_id).forEach((unit) => {
            if (unit == undefined) return;
            if (unit.next_turn_after > max) {
                max = unit.next_turn_after
            }
        })

        return max
    }

    export function get_units_amount(battle: Battle, ) {
        return battle.last
    }

    export function get_unit(battle: Battle, i: character_id): Character {
        return Data.Characters.from_id(i)
    }

    export function get_selected_unit(battle: Battle, ): Character|undefined {
        if (battle.last == 0) return undefined
        const current = battle.heap[0]
        if (current == undefined) return undefined
        return get_unit(battle, current)
    }

    export function delete_unit(battle: Battle, x: Character): boolean {
        var position = undefined
        for (let i = 0; i < battle.last; i++) {
            if (battle.heap[i] == x.id) position = i
        }
        if (position == undefined) return false;

        battle.last -= 1
        battle.heap[position] = battle.heap[battle.last]
        shift_down(battle, position)

        x.battle_id = undefined

        battle.heap = battle.heap.splice(battle.last - 1, 1)

        return true
    }

    export function push(battle: Battle, obj: character_id) {
        battle.heap[battle.last] = obj;
        battle.last += 1;
        shift_up(battle, battle.last - 1)
    }

    export function shift_up(battle: Battle, i:number) {
        let tmp = i;
        while ((tmp > 0) && (get_value(battle, tmp) < get_value(battle, Math.floor((tmp - 1) / 2)))) {
            swap(battle, tmp, Math.floor((tmp - 1) / 2))
            tmp = Math.floor((tmp - 1) / 2)
        }
    }

    export function shift_down(battle: Battle, i: number) {
        let tmp = i;
        while (tmp * 2 + 1 < battle.last) {
            if (tmp * 2 + 2 < battle.last) {
                if ((get_value(battle, tmp * 2 + 2) < get_value(battle, tmp * 2 + 1)) && (get_value(battle, tmp * 2 + 2) < get_value(battle, tmp))) {
                    swap(battle, tmp, tmp * 2 + 2)
                    tmp = tmp * 2 + 2
                } else if (get_value(battle, tmp * 2 + 1) < get_value(battle, tmp)) {
                    swap(battle, tmp, tmp * 2 + 1)
                    tmp = tmp * 2 + 1
                } else {
                    break
                }
            } else if (get_value(battle, tmp * 2 + 1) < get_value(battle, tmp)) {
                swap(battle, tmp, tmp * 2 + 1)
                tmp = tmp * 2 + 1
            } else {
                break
            }
        }
    }

    export function add_unit(battle: Battle, u: Character) {
        push(battle, u.id)
    }

    export function swap(battle: Battle, a: number, b: number) {
        let s = battle.heap[a];
        battle.heap[a] = battle.heap[b]
        battle.heap[b] = s
    }

    export function pop(battle: Battle, ):character_id|undefined {
        if (battle.last == 0) {
            return undefined
        }
        let tmp = battle.heap[0]
        battle.last -= 1
        battle.heap[0] = battle.heap[battle.last]
        battle.heap.length = battle.last
        shift_down(battle, 0);
        return tmp
    }

    export function update(battle: Battle, dt: number) {
        for (let i = 0; i < battle.last; i++) {
            const id = battle.heap[i]
            if (id == undefined) continue;
            const unit = Data.Characters.from_id(id)
            unit.next_turn_after = unit.next_turn_after - dt
        }
    }
}



