"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cotton_to_cloth = void 0;
const CraftBulk_1 = require("./CraftBulk");
exports.cotton_to_cloth = (0, CraftBulk_1.new_craft_bulk)('cotton_to_textile', [{ material: 2 /* MATERIAL.COTTON */, amount: 1 }], [{ material: 3 /* MATERIAL.TEXTILE */, amount: 1 }], [{ skill: 'clothier', difficulty: 5 }]);
