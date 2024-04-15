"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.coastal_constraints = exports.simple_constraints = exports.steppe_constraints = exports.urban_constraints = exports.forest_constraints = void 0;
const system_1 = require("../map/system");
function forest_constraints(cell) {
    if (!system_1.MapSystem.can_move([cell.x, cell.y]))
        return false;
    if (system_1.MapSystem.forestation(cell.id) > 300) {
        return true;
    }
    return false;
}
exports.forest_constraints = forest_constraints;
function urban_constraints(cell) {
    return (system_1.MapSystem.urbanisation(cell.id) > 0) && (system_1.MapSystem.can_move([cell.x, cell.y]));
}
exports.urban_constraints = urban_constraints;
function steppe_constraints(cell) {
    if (!system_1.MapSystem.can_move([cell.x, cell.y]))
        return false;
    if (forest_constraints(cell))
        return false;
    if (urban_constraints(cell))
        return false;
    return true;
}
exports.steppe_constraints = steppe_constraints;
function simple_constraints(cell) {
    return system_1.MapSystem.can_move([cell.x, cell.y]);
}
exports.simple_constraints = simple_constraints;
function coastal_constraints(cell) {
    return system_1.MapSystem.sea_nearby(cell.id);
}
exports.coastal_constraints = coastal_constraints;
