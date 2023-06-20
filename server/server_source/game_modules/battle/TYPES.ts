import {Battle} from "./classes/battle"
import { Unit } from "./classes/unit";
import {Character} from "../character/character"
import { action_points, battle_position } from "@custom_types/battle_data";

export type BattleApCost = (battle: Battle, character: Character, unit: Unit) => action_points;
export type BattleNumber = (battle: Battle, character: Character, unit: Unit) => number
export type BattleActionExecution = (battle: Battle, character: Character, unit: Unit) => void

export type BattleApCostPosition = (battle: Battle, character: Character, unit: Unit, target: battle_position) => action_points;
export type BattleNumberPosition = (battle: Battle, character: Character, unit: Unit, target: battle_position) => number
export type BattleActionExecutionPosition = (battle: Battle, character: Character, unit: Unit, target: battle_position) => void

export type BattleApCostTarget = (battle: Battle, character: Character, unit: Unit, target_character: Character, target_unit: Unit) => action_points;
export type BattleNumberTarget = (battle: Battle, character: Character, unit: Unit, target_character: Character, target_unit: Unit) => number
export type BattleActionExecutionTarget = (battle: Battle, character: Character, unit: Unit, target_character: Character, target_unit: Unit, ignore_flag?: boolean) => void