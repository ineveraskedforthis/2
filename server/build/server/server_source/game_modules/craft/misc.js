"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const materials_manager_1 = require("../manager_classes/materials_manager");
const CraftBulk_1 = require("./CraftBulk");
(0, CraftBulk_1.new_craft_bulk)('cotton_to_textile', [{ material: materials_manager_1.COTTON, amount: 1 }], [{ material: materials_manager_1.TEXTILE, amount: 1 }], [{ skill: 'clothier', difficulty: 5 }]);
