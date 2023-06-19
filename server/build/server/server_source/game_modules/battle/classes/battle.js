"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Battle = void 0;
class Battle {
    constructor(id, heap) {
        this.heap = heap;
        this.id = id;
        this.date_of_last_turn = '%';
        this.waiting_for_input = false;
        this.ended = false;
        this.turn_ended = true;
        this.last_event_index = 0;
        this.grace_period = 0;
        this.battle_history = [];
    }
}
exports.Battle = Battle;
