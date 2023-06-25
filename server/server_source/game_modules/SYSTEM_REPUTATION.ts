import { Character } from "./character/character";
import { Data } from "./data";
import { hostile } from "./races/racial_hostility";

export function handle_attack_reputation_change(attacker: Character, defender: Character, AOE_flag: boolean) {
    if (AOE_flag) return;

    Data.Reputation.set_a_X_b(defender.id, 'enemy', attacker.id)
}

export function can_talk(character_A: Character, character_B: Character) : boolean {
    if (character_A.race != character_B.race) return false
    if (is_enemy_characters(character_A, character_B)) return false

    return true
}

export function is_enemy_characters(character: Character, target_character: Character) {
    // death check
    if (target_character.dead()) {
        // console.log('dead target')
        return false
    }
        
    if (character.dead()){
        // console.log('i am dead')
        return false
    }            

    // hostility check:
    // if there is no racial hostility, then check for reputational hostility
    if (!hostile(character.race, target_character.race)) {
        // console.log('no racial hostility')
        // we know that they are not hostile because of race.
        // so we check if there target_character has bad reputation with character's faction
        // console.log('target is enemy of me', Data.Reputation.a_is_enemy_of_b(target_character.id, character.id))
        // console.log('me is enemy of target', Data.Reputation.a_is_enemy_of_b(character.id, target_character.id))
        if (!Data.Reputation.a_is_enemy_of_b(target_character.id, character.id) && !Data.Reputation.a_is_enemy_of_b(character.id, target_character.id)) {
            // if he is not a racial enemy and not an reputational enemy, then he is not an enemy
            // being in separate teams must be just an accident
            // i should consider tracking personal relationships
            return false
        }
    }

    // otherwise, he is an enemy
    return true
}