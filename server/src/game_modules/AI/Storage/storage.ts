import { MaterialData } from "@content/content";
import { Character } from "../../character/character";
import { LocationInterface } from "../../location/location_interface";
import { CellData } from "../../map/cell_interface";
import { AIAction, AIActionSpecific } from "../Types/types";

export class AIActionsStorage {
    static Location : AIAction<LocationInterface>[] = []
    static Character : AIAction<Character>[] = []
    static Cell : AIAction<CellData>[] = []
    static Self : AIAction<Character>[] = []
    static Material : AIAction<MaterialData>[] = []

    static register_action_location(action: AIAction<LocationInterface>) {
        this.Location.push(action)
        return action
    }

    static register_action_character(action: AIAction<Character>) {
        this.Character.push(action)
        return action
    }

    static register_action_cell(action: AIAction<CellData>) {
        this.Cell.push(action)
        return action
    }

    static register_action_self(action: AIAction<Character>) {
        this.Self.push(action)
        return action
    }

    static register_action_material(action: AIAction<MaterialData>) {
        this.Material.push(action)
        return action
    }

    static get actions() : AIAction<any>[] {
        const result : AIActionSpecific[] = []
        return result.concat(this.Location, this.Character, this.Cell, this.Self, this.Material)
    }
}