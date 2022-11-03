"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrate = void 0;
const game_launch_1 = require("./game_launch");
function migrate(current_version, target_version) {
    console.log('migration from ' + current_version + ' to ' + target_version);
    if (current_version == 0) {
        set_up_initial_data();
    }
}
exports.migrate = migrate;
function set_up_initial_data() {
    (0, game_launch_1.set_version)(1);
}
