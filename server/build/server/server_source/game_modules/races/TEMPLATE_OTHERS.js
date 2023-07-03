"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BallTemplate = void 0;
const generate_name_moraes_1 = require("./generate_name_moraes");
exports.BallTemplate = {
    model: 'ball',
    ai_map: 'forest_dweller',
    ai_battle: 'basic',
    race: 'ball',
    stats: "Ball",
    resists: "Ball",
    name_generator: generate_name,
    max_hp: "Ball",
};
const moraes = ['gu', 'bu', 'mu', 'zu', 'du'];
function generate_name() {
    return (0, generate_name_moraes_1.gen_from_moraes)(moraes, 5);
}
