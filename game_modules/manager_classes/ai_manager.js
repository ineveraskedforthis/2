"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiManager = void 0;
const racial_hostility_1 = require("../base_game_classes/races/racial_hostility");
const action_manager_1 = require("./action_manager");
// function MAYOR_AI(mayor: CharacterGenericPart) {
//     let faction = mayor.get_faction()
//     let territories = faction.get_territories_list()
//     for (let ter of territories)  {
//         if (ter.is_contested(faction)) {
//             let enemy = ter.get_largest_enemy_faction(faction)
//             mayor.create_quest({quest_tag: "extermination", target_tag: enemy.get_tag(), territory: ter.tag}, {reputation: 1, money:1})
//         }
//     }
// }
// export const AI = {
//     'major' : MAYOR_AI
// }
let dp = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [-1, -1]];
class AiManager {
    constructor(world) {
        this.world = world;
    }
    path_finding_calculations() {
    }
    move_toward_colony(char) {
    }
    enemies_in_cell(char) {
        let cell = char.get_cell();
        if (cell == undefined)
            return false;
        let a = cell.get_characters_set();
        for (let id of a) {
            let target_char = this.world.get_char_from_id(id);
            if ((0, racial_hostility_1.hostile)(char.get_tag(), target_char.get_tag())) {
                if (!target_char.in_battle() && !target_char.is_dead()) {
                    return target_char.id;
                }
            }
        }
        return -1;
    }
    async random_steppe_walk(char) {
        let cell = char.get_cell();
        if (cell == undefined) {
            return;
        }
        let possible_moves = [];
        for (let d of dp) {
            let tmp = [d[0] + cell.i, d[1] + cell.j];
            let territory = this.world.get_territory(tmp[0], tmp[1]);
            let new_cell = this.world.get_cell(tmp[0], tmp[1]);
            if (new_cell != undefined) {
                if (this.world.can_move(tmp[0], tmp[1]) && (territory != 'colony') && (new_cell.development['wild'] < 1)) {
                    possible_moves.push(tmp);
                }
            }
        }
        if (possible_moves.length > 0) {
            let move_direction = possible_moves[Math.floor(Math.random() * possible_moves.length)];
            await this.world.action_manager.start_action(action_manager_1.CharacterAction.MOVE, char, { x: move_direction[0], y: move_direction[1] });
        }
    }
    async random_forest_walk(char) {
        let cell = char.get_cell();
        if (cell == undefined) {
            return;
        }
        let possible_moves = [];
        for (let d of dp) {
            let tmp = [d[0] + cell.i, d[1] + cell.j];
            let territory = this.world.get_territory(tmp[0], tmp[1]);
            let new_cell = this.world.get_cell(tmp[0], tmp[1]);
            if (new_cell != undefined) {
                if (this.world.can_move(tmp[0], tmp[1]) && (territory != 'colony') && (new_cell.development['wild'] > 0)) {
                    possible_moves.push(tmp);
                }
            }
        }
        if (possible_moves.length > 0) {
            let move_direction = possible_moves[Math.floor(Math.random() * possible_moves.length)];
            await this.world.action_manager.start_action(action_manager_1.CharacterAction.MOVE, char, { x: move_direction[0], y: move_direction[1] });
        }
    }
    async decision(char) {
        // console.log(char.misc.ai_tag)
        if (char.is_player()) {
            return;
        }
        if (char.in_battle()) {
            return;
        }
        if (char.action_started) {
            return;
        }
        switch (char.misc.ai_tag) {
            case 'steppe_walker_agressive': {
                if ((char.get_fatigue() > 30) || (char.get_stress() > 30)) {
                    await this.world.action_manager.start_action(action_manager_1.CharacterAction.REST, char, undefined);
                }
                else {
                    let target = this.enemies_in_cell(char);
                    if (target != -1) {
                        await this.world.action_manager.start_action(action_manager_1.CharacterAction.ATTACK, char, target);
                    }
                    else {
                        await this.random_steppe_walk(char);
                    }
                }
                break;
            }
            case 'steppe_walker_passive': {
                if ((char.get_fatigue() > 30) || (char.get_stress() > 30)) {
                    await this.world.action_manager.start_action(action_manager_1.CharacterAction.REST, char, undefined);
                }
                else {
                    await this.random_steppe_walk(char);
                }
                break;
            }
            case 'forest_walker': {
                if ((char.get_fatigue() > 30) || (char.get_stress() > 30)) {
                    await this.world.action_manager.start_action(action_manager_1.CharacterAction.REST, char, undefined);
                }
                else {
                    await this.random_forest_walk(char);
                }
                break;
            }
        }
    }
}
exports.AiManager = AiManager;
