import {Battle} from "./classes/battle"
import { Unit } from "./classes/unit";
import {Character} from "../character/character"
import { action_points } from "@custom_types/battle_data";

export type BattleApCost = (battle: Battle, character: Character, unit: Unit) => action_points;
export type BattleNumber = (battle: Battle, character: Character, unit: Unit) => number
export type BattleActionExecution = (battle: Battle, character: Character, unit: Unit) => void


export type BattleApCostTarget = (battle: Battle, character: Character, unit: Unit, target_character: Character, target_unit: Unit) => action_points;
export type BattleNumberTarget = (battle: Battle, character: Character, unit: Unit, target_character: Character, target_unit: Unit) => number
export type BattleActionExecutionTarget = (battle: Battle, character: Character, unit: Unit, target_character: Character, target_unit: Unit) => void