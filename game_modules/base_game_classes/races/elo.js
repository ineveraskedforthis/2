"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.elo = void 0;
const generate_name_moraes_1 = require("./generate_name_moraes");
let moraes = ['xi', 'lo', 'mi', 'ki', 'a', 'i', 'ku'];
async function elo(pool, char) {
    char.misc.tag = 'elo';
    char.misc.ai_tag = 'forest_walker';
    char.misc.model = 'elodino';
    char.stats.phys_power = 10;
    char.stats.magic_power = 20;
    char.name = (0, generate_name_moraes_1.gen_from_moraes)(moraes, 3);
    char.status.hp = 200;
    char.stats.max.hp = 200;
    char.skills.perks.claws = true;
    await char.save_to_db(pool);
}
exports.elo = elo;
