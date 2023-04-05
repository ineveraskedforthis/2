"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simple_constraints = exports.steppe_constraints = exports.forest_constraints = void 0;
const system_1 = require("../map/system");
function forest_constraints(cell) {
    return (cell.development['urban'] < 1)
        && (cell.development['wild'] > 0)
        && (system_1.MapSystem.can_move([cell.x, cell.y]));
}
exports.forest_constraints = forest_constraints;
function steppe_constraints(cell) {
    return (cell.development['urban'] < 1)
        && (cell.development['wild'] < 1)
        && (system_1.MapSystem.can_move([cell.x, cell.y]));
}
exports.steppe_constraints = steppe_constraints;
function simple_constraints(cell) {
    return system_1.MapSystem.can_move([cell.x, cell.y]);
}
exports.simple_constraints = simple_constraints;
