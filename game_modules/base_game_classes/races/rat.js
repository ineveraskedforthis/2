"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rat = void 0;
async function rat(pool, char) {
    char.misc.tag = 'rat';
    char.misc.ai_tag = 'aggressive_walker';
    char.misc.model = 'rat';
    char.stats.phys_power = 5;
    char.stats.magic_power = 5;
    char.status.hp = 50;
    char.stats.max.hp = 50;
    char.skills.perks.claws = true;
    await char.save_to_db(pool);
}
exports.rat = rat;
