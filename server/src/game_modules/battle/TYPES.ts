import {Battle} from "./classes/battle"
import {Character} from "../character/character"
import { action_points, battle_position } from "@custom_types/battle_data";

export type BattleApCost = (battle: Battle, character: Character, ) => action_points;
export type BattleNumber = (battle: Battle, character: Character, ) => number
export type BattleActionExecution = (battle: Battle, character: Character, available_points: action_points) => void

export type BattleApCostPosition = (battle: Battle, character: Character, target: battle_position) => action_points;
export type BattleNumberPosition = (battle: Battle, character: Character, target: battle_position) => number
export type BattleActionExecutionPosition = (battle: Battle, character: Character, target: battle_position, available_points: action_points) => void

export type BattleApCostTarget = (battle: Battle, character: Character, target_character: Character, ) => action_points;
export type BattleNumberTarget = (battle: Battle, character: Character, target_character: Character, ) => number
export type BattleActionExecutionTarget = (battle: Battle, character: Character, target_character: Character, available_points: action_points, ignore_flag?: boolean) => void