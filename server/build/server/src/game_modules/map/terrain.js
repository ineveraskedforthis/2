"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.terrain_available_space = exports.terrain_can_move = exports.terrain_to_string = exports.string_to_terrain = void 0;
function string_to_terrain(string) {
    switch (string) {
        case 'void': return 0 /* Terrain.void */;
        case 'steppe': return 1 /* Terrain.steppe */;
        case 'sea': return 2 /* Terrain.sea */;
        case 'coast': return 3 /* Terrain.coast */;
        case 'rupture': return 4 /* Terrain.rupture */;
        case 'ashlands': return 5 /* Terrain.ashlands */;
    }
    return 0 /* Terrain.void */;
}
exports.string_to_terrain = string_to_terrain;
function terrain_to_string(terrain) {
    switch (terrain) {
        case 0 /* Terrain.void */: return 'void';
        case 1 /* Terrain.steppe */: return 'steppe';
        case 2 /* Terrain.sea */: return 'sea';
        case 3 /* Terrain.coast */: return 'coast';
        case 4 /* Terrain.rupture */: return 'rupture';
        case 5 /* Terrain.ashlands */: return 'ashlands';
    }
}
exports.terrain_to_string = terrain_to_string;
function terrain_can_move(terrain) {
    if (terrain == 2 /* Terrain.sea */)
        return false;
    if (terrain == 4 /* Terrain.rupture */)
        return false;
    if (terrain == 0 /* Terrain.void */)
        return false;
    return true;
}
exports.terrain_can_move = terrain_can_move;
function terrain_available_space(terrain) {
    switch (terrain) {
        case 0 /* Terrain.void */: return 0;
        case 1 /* Terrain.steppe */: return 3;
        case 2 /* Terrain.sea */: return 0;
        case 3 /* Terrain.coast */: return 1;
        case 4 /* Terrain.rupture */: return 0;
        case 5 /* Terrain.ashlands */: return 3;
    }
}
exports.terrain_available_space = terrain_available_space;
