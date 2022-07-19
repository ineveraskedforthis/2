"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rat = void 0;
const generate_name_moraes_1 = require("./generate_name_moraes");
let moraes = ['s', 'shi', "S'", "fu", 'fi'];
async function rat(pool, char) {
    char.misc.tag = 'rat';
    char.misc.ai_tag = 'steppe_walker_agressive';
    char.misc.model = 'rat';
    char.stats.phys_power = 5;
    char.stats.magic_power = 5;
    char.name = (0, generate_name_moraes_1.gen_from_moraes)(moraes, 5);
    char.status.hp = 50;
    char.stats.max.hp = 50;
    char.skills.perks.claws = true;
    await char.save_to_db(pool);
}
exports.rat = rat;
