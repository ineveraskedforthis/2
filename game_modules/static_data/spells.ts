import { AttackResult } from "../base_game_classes/misc/attack_result";
import { DamageByTypeObject } from "../base_game_classes/misc/damage_types";

export type spell_tags = 'bolt'|'charge'

export const spells = {
    'bolt': (result:AttackResult) => {
        let damage:DamageByTypeObject = new DamageByTypeObject(5, 0, 0, 0)
        result.damage = damage;
        return result;
    },
    'charge': (result:AttackResult) => {
        let damage = {};
        result.damage = new DamageByTypeObject(10, 0, 0, 0);
        result.flags.close_distance = true;
        result.attacker_status_change.rage = 20;
        return result;
    }
}