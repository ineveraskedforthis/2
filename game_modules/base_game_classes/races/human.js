"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.human = void 0;
async function human(pool, char) {
    char.misc.tag = 'human';
    char.misc.model = 'test';
    await char.save_to_db(pool);
}
exports.human = human;
