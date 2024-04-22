import { MaterialData } from "@content/content";
import { Character } from "../../data/entities/character";
import { LocationInterface } from "../../location/location_interface";
import { CellData } from "../../map/cell_interface";

export interface AIAction<Target> {
    tag : string,
    utility             : (actor: Character, target:Target)     => number,
    potential_targets   : (actor: Character)                    => Target[],
    action              : (actor: Character, target: Target)    => void
}

export type AIActionSpecific = AIAction<LocationInterface>|AIAction<Character>|AIAction<CellData>|AIAction<MaterialData>