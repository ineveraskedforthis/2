import { Character } from "../character/character";
import { CharacterSystem } from "../character/system";

const AVERAGE_SKILL = 30
const IDEAL_DIST = 20 // AVERAGE_SKILL archer can hit with 1 probability in ideal conditions
const STRESS_HINDER = 0.2 // maximal reduction to accuracy
const RAGE_HINDER = 0.2 // maximal reduction to accuracy

const EASY_DIST = 5 // EVERY ARCHER CAN HIT AT THIS DISTANCE
const DIFFICULTY_BEYOND_IDEAL_SCALE = 5

export namespace Accuracy {
    export function ranged(character: Character, distance: number) {
        if (distance < EASY_DIST) return 1

        let skill_difficulty_multiplier = 60
        const ranged_skill = CharacterSystem.skill(character, 'ranged')
        if (ranged_skill > 0) {
            skill_difficulty_multiplier = AVERAGE_SKILL / ranged_skill
        }

        const difficulty = (distance - EASY_DIST) * skill_difficulty_multiplier
        const ideal_difficulty = IDEAL_DIST - EASY_DIST

        let base_accuracy = 1
        if (ideal_difficulty < difficulty) {
            base_accuracy = 5 / (5 + (difficulty - ideal_difficulty) / DIFFICULTY_BEYOND_IDEAL_SCALE)
        }

        let accuracy = base_accuracy * (1 - STRESS_HINDER * character.status.stress / 100) * (1 - RAGE_HINDER * character.status.rage / 100)
        return Math.min(accuracy, 1)
    }

    // melee always hit
    // export function melee(character: Character) {
    //     let base_accuracy = 1
    //     let accuracy = base_accuracy * (1 - STRESS_HINDER * character.status.stress / 100) * (1 - RAGE_HINDER * character.status.rage)
    //     return Math.min(accuracy, 1)
    // }
}

    
    // get_accuracy(result: {weapon_type: WEAPON_TYPE}, mod: 'fast'|'heavy'|'usual'|'ranged', distance?: number) {
    //     let base_accuracy = character_defines.accuracy + this.get_weapon_skill(result.weapon_type) * character_defines.skill_accuracy_modifier

    //     let blood_burden = character_defines.blood_accuracy_burden;
    //     let rage_burden = character_defines.rage_accuracy_burden

    //     let blood_acc_loss = this.status.blood * blood_burden;
    //     let rage_acc_loss = this.status.rage * rage_burden;
    //     let stress_acc_loss = this.status.stress * 0.01

    //     let final = base_accuracy - blood_acc_loss - rage_acc_loss - stress_acc_loss

    //     if ((distance != undefined) && (mod == 'ranged')) {
    //         if (distance < 2) distance = 2
    //         distance = Math.sqrt(distance - 2) / 2 + 2
    //         final = final / (distance - 1.5)
    //         return Math.min(1, Math.max(0, final))
    //     }

    //     return Math.min(1, Math.max(0.1, final))
    // }    

    // get_attack_chance(mod: 'fast'|'heavy'|'usual'|'ranged', distance?: number) {
    //     let weapon = this.equip.data.weapon
    //     let weapon_type = WEAPON_TYPE.NOWEAPON
    //     if (weapon != undefined) {
    //         weapon_type = weapon.get_weapon_type()
    //     }

    //     return this.get_accuracy({weapon_type: weapon_type}, mod, distance)
    // }