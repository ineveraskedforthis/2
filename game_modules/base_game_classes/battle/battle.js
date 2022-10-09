"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Battle = void 0;
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
