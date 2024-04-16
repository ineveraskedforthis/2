import { Character } from "../character/character";
import { Stash } from "../inventories/stash";
import { trim } from "../calculations/basic_functions";
import { CHANGE_REASON, Effect } from "../events/effects";
import { skill_check, box } from "@custom_types/inventory";
import { Event } from "../events/events";
import { CharacterSystem } from "../character/system";

export const MAX_SKILL_MULTIPLIER_BULK = 10
export function skill_to_ratio(skill: number, difficulty: number) {
    return trim(skill / difficulty, 0, MAX_SKILL_MULTIPLIER_BULK);
}

export function roll_skill_improvement(current: number, target: number) {
    if (current == 0)
        return true;
    if (target == 0)
        return false;

    const dice = Math.random();
    if (dice < (trim(target * 2, 0, 100) - current) / trim(target * 2, 0, 100))
        return true;
}

export function on_craft_update(character: Character, difficulty: skill_check[]) {
    let fatigue = 5;
    for (let item of difficulty) {
        const pure_skill = CharacterSystem.pure_skill(character, item.skill);
        const total_skill = CharacterSystem.skill(character, item.skill);
        if (roll_skill_improvement(pure_skill, item.difficulty)) {
            Effect.Change.skill(character, item.skill, 1, CHANGE_REASON.CRAFTING);
        }
        fatigue += trim(item.difficulty - total_skill, 0, 20);
    }

    Effect.Change.stress(character, 1, CHANGE_REASON.CRAFTING);
    Effect.Change.fatigue(character, fatigue, CHANGE_REASON.CRAFTING);
}



export function check_inputs(inputs: box[], stash: Stash) {
    let flag = true;
    for (let item of inputs) {
        let tmp = stash.get(item.material);
        if ((tmp < item.amount)) {
            flag = false;
        }
    }
    return flag;
}

export function use_input(input: box[], character: Character) {
    for (let item of input) {
        Event.change_stash(character, item.material, -item.amount)
    }
}
