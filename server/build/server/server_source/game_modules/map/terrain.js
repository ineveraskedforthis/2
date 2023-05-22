"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.terrain_can_move = exports.terrain_to_string = exports.string_to_terrain = exports.Terrain = void 0;
var Terrain;
(function (Terrain) {
    Terrain[Terrain["void"] = 0] = "void";
    Terrain[Terrain["steppe"] = 1] = "steppe";
    Terrain[Terrain["sea"] = 2] = "sea";
    Terrain[Terrain["coast"] = 3] = "coast";
    Terrain[Terrain["rupture"] = 4] = "rupture";
    Terrain[Terrain["ashlands"] = 5] = "ashlands";
})(Terrain = exports.Terrain || (exports.Terrain = {}));
function string_to_terrain(string) {
    switch (string) {
        case 'void': return Terrain.void;
        case 'steppe': return Terrain.steppe;
        case 'sea': return Terrain.sea;
        case 'coast': return Terrain.coast;
        case 'rupture': return Terrain.rupture;
        case 'ashlands': return Terrain.ashlands;
    }
    return Terrain.void;
}
exports.string_to_terrain = string_to_terrain;
function terrain_to_string(terrain) {
    switch (terrain) {
        case Terrain.void: return 'void';
        case Terrain.steppe: return 'steppe';
        case Terrain.sea: return 'sea';
        case Terrain.coast: return 'coast';
        case Terrain.rupture: return 'rupture';
        case Terrain.ashlands: return 'ashlands';
    }
}
exports.terrain_to_string = terrain_to_string;
function terrain_can_move(terrain) {
    if (terrain == Terrain.sea)
        return false;
    if (terrain == Terrain.rupture)
        return false;
    if (terrain == Terrain.void)
        return false;
    return true;
}
exports.terrain_can_move = terrain_can_move;
