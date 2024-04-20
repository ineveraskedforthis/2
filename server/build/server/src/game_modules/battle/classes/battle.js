"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Battle = void 0;
const data_id_1 = require("../../data/data_id");
class Battle {
    constructor(id) {
        this.last = 0;
        this.heap = [];
        this.queue = [];
        if (id == undefined) {
            this.id = data_id_1.DataID.Battle.new_id();
        }
        else {
            data_id_1.DataID.Battle.register(id, []);
            this.id = id;
        }
        this.date_of_last_turn = '%';
        this.waiting_for_input = false;
        this.last_event_index = 0;
        this.grace_period = 6;
        this.stopped = false;
        this.battle_history = [];
    }
}
exports.Battle = Battle;
