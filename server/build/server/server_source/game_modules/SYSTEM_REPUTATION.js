"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.is_enemy_characters = exports.can_talk = exports.handle_attack_reputation_change = void 0;
const data_1 = require("./data");
const racial_hostility_1 = require("./races/racial_hostility");
function handle_attack_reputation_change(attacker, defender, AOE_flag) {
    if (AOE_flag)
        return;
    data_1.Data.Reputation.set_a_X_b(defender.id, 'enemy', attacker.id);
}
exports.handle_attack_reputation_change = handle_attack_reputation_change;
function can_talk(character_A, character_B) {
    if (character_A.race() != character_B.race())
        return false;
    if (is_enemy_characters(character_A, character_B))
        return false;
    return true;
}
exports.can_talk = can_talk;
function is_enemy_characters(character, target_character) {
    // death check
    if (target_character.dead()) {
        // console.log('dead target')
        return false;
    }
    if (character.dead()) {
        // console.log('i am dead')
        return false;
    }
    // hostility check:
    // if there is no racial hostility, then check for reputational hostility
    if (!(0, racial_hostility_1.hostile)(character.race(), target_character.race())) {
        // console.log('no racial hostility')
        // we know that they are not hostile because of race.
        // so we check if there target_character has bad reputation with character's faction
        // console.log('target is enemy of me', Data.Reputation.a_is_enemy_of_b(target_character.id, character.id))
        // console.log('me is enemy of target', Data.Reputation.a_is_enemy_of_b(character.id, target_character.id))
        if (!data_1.Data.Reputation.a_is_enemy_of_b(target_character.id, character.id) && !data_1.Data.Reputation.a_is_enemy_of_b(character.id, target_character.id)) {
            // if he is not a racial enemy and not an reputational enemy, then he is not an enemy
            // being in separate teams must be just an accident
            // i should consider tracking personal relationships
            return false;
        }
    }
    // otherwise, he is an enemy
    return true;
}
exports.is_enemy_characters = is_enemy_characters;
