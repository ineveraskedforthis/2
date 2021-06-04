"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiManager = void 0;
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
        let a = cell.get_characters_list();
        for (let id of a) {
            let target_char = this.world.get_char_from_id(id);
            if ((target_char.get_tag() == 'test') && (char.get_tag() == 'rat') || (target_char.get_tag() == 'test') && (char.get_tag() == 'rat')) {
                if (!target_char.in_battle()) {
                    return target_char.id;
                }
            }
        }
        return -1;
    }
    random_walk(char) {
        let cell = char.get_cell();
        if (cell == undefined) {
            return;
        }
        let possible_moves = [];
        for (let d of dp) {
            let tmp = [d[0] + cell.i, d[1] + cell.j];
            if (this.world.can_move(tmp[0], tmp[1])) {
                possible_moves.push(tmp);
            }
        }
        if (possible_moves.length > 0) {
            let move_direction = possible_moves[Math.floor(Math.random() * possible_moves.length)];
            this.world.action_manager.start_action(action_manager_1.CharacterAction.MOVE, char, move_direction);
        }
    }
    decision(char) {
        if (char.misc.ai_tag == 'rat') {
            if (!char.in_battle() && !char.action_started) {
                let target = this.enemies_in_cell(char);
                if (target != -1) {
                    this.world.action_manager.start_action(action_manager_1.CharacterAction.ATTACK, char, target);
                }
                else {
                    this.random_walk(char);
                }
            }
        }
    }
}
exports.AiManager = AiManager;
