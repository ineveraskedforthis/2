import { AttackObj } from "../attack/class";
import { Damage } from "../misc/damage_types";

export type spell_tags = 'bolt'|'charge'

export const spells = {
    'bolt': (result:AttackObj) => {
        let damage:Damage = new Damage(5, 0, 0, 0)
        result.damage = damage;
        return result;
    },
    'charge': (result:AttackObj) => {
        let damage = {};
        result.damage = new Damage(10, 0, 0, 0);
        result.flags.close_distance = true;
        result.attacker_status_change.rage = 20;
        return result;
    }
}