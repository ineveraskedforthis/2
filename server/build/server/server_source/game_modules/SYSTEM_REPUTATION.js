"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handle_attack_reputation_change = void 0;
const data_1 = require("./data");
function handle_attack_reputation_change(attacker, defender, AOE_flag) {
    if (AOE_flag)
        return;
    data_1.Data.Reputation.set_a_X_b(defender.id, 'enemy', attacker.id);
}
exports.handle_attack_reputation_change = handle_attack_reputation_change;
