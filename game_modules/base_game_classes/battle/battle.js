"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flee_chance = exports.BattleReworked2 = exports.Battle = void 0;
var common = require("./common.js");
var { constants } = require("./static_data/constants.js");
class Battle {
    constructor(id, heap) {
        this.heap = heap;
        this.id = id;
        this.date_of_last_turn = '%';
        this.waiting_for_input = false;
        this.ended = false;
        this.last_event_index = 0;
    }
}
exports.Battle = Battle;
class BattleReworked2 {
    // networking
    send_data_start() {
        this.world.socket_manager.send_battle_data_start(this);
        if (this.waiting_for_input) {
            this.send_action({ action: 'new_turn', target: this.heap.selected });
        }
    }
    send_update() {
        this.world.socket_manager.send_battle_update(this);
        if (this.waiting_for_input) {
            this.send_action({ action: 'new_turn', target: this.heap.selected });
        }
    }
    send_current_turn() {
        this.send_action({ action: 'new_turn', target: this.heap.selected });
    }
    send_action(a) {
        this.world.socket_manager.send_battle_action(this, a);
    }
    send_stop() {
        this.world.socket_manager.send_stop_battle(this);
    }
}
exports.BattleReworked2 = BattleReworked2;
function flee_chance(character) {
    return 0.4;
}
exports.flee_chance = flee_chance;
