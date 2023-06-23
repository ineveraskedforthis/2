import { Character } from "./character/character";
import { Data } from "./data";

export function handle_attack_reputation_change(attacker: Character, defender: Character, AOE_flag: boolean) {
    if (AOE_flag) return;

    Data.Reputation.set_a_X_b(defender.id, 'enemy', attacker.id)
}