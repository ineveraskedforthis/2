"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CharacterAction = exports.ActionManager = void 0;
const move_1 = require("../base_game_classes/character_actions/move");
const eat_1 = require("../base_game_classes/character_actions/eat");
const cook_meat_1 = require("../base_game_classes/character_actions/cook_meat");
const clean_1 = require("../base_game_classes/character_actions/clean");
const rest_1 = require("../base_game_classes/character_actions/rest");
const hunt_1 = require("../base_game_classes/character_actions/hunt");
class ActionManager {
    constructor(world, pool) {
        this.pool = pool;
        this.world = world;
        this.actions = [];
        this.add_action(move_1.move);
        this.add_action(clean_1.clean);
        this.add_action(cook_meat_1.cook_meat);
        this.add_action(eat_1.eat);
        this.add_action(hunt_1.hunt);
        this.add_action(rest_1.rest);
    }
    add_action(action) {
        this.actions.push(action);
    }
    async start_action(action_id, char, data) {
        let action = this.actions[action_id];
        let check = await action.check(this.pool, char, data);
        if (check == 1 /* OK */) {
            await action.start(this.pool, char, data);
            char.action_started = true;
            char.current_action = action_id;
            char.action_progress = 0;
        }
        return check;
    }
    async action(action_id, char, data) {
        let action = this.actions[action_id];
        char.action_started = false;
        let check = await action.check(this.pool, char, data);
        if (check == 1 /* OK */) {
            return await action.result(this.pool, char, data);
        }
        return check;
    }
}
exports.ActionManager = ActionManager;
var CharacterAction;
(function (CharacterAction) {
    CharacterAction[CharacterAction["MOVE"] = 0] = "MOVE";
    CharacterAction[CharacterAction["CLEAN"] = 1] = "CLEAN";
    CharacterAction[CharacterAction["COOK_MEAT"] = 2] = "COOK_MEAT";
    CharacterAction[CharacterAction["EAT"] = 3] = "EAT";
    CharacterAction[CharacterAction["HUNT"] = 4] = "HUNT";
    CharacterAction[CharacterAction["REST"] = 5] = "REST";
})(CharacterAction = exports.CharacterAction || (exports.CharacterAction = {}));
