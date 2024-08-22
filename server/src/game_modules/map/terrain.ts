import { Terrain } from "@custom_types/common";

export function string_to_terrain(string: string){
    switch(string) {
        case 'void': return Terrain.void;
        case 'steppe': return Terrain.steppe;
        case 'sea': return Terrain.sea;
        case 'coast': return Terrain.coast;
        case 'rupture': return Terrain.rupture;
        case 'ashlands': return Terrain.ashlands;
    }
    return Terrain.void
}

export function terrain_to_string(terrain: Terrain) {
    switch(terrain) {
        case Terrain.void:return 'void'
        case Terrain.steppe:return 'steppe'
        case Terrain.sea:return 'sea'
        case Terrain.coast:return 'coast'
        case Terrain.rupture:return 'rupture'
        case Terrain.ashlands:return 'ashlands'
    }
}

export function terrain_can_move(terrain: Terrain) {
    if (terrain == Terrain.sea) return false
    if (terrain == Terrain.rupture) return false
    if (terrain == Terrain.void) return false
    return true
}

export function terrain_available_space(terrain: Terrain): number {
    switch(terrain) {
        case Terrain.void:return 0
        case Terrain.steppe:return 3
        case Terrain.sea:return 0
        case Terrain.coast:return 1
        case Terrain.rupture:return 0
        case Terrain.ashlands:return 3
    }
}