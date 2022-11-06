"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Effect = void 0;
const user_manager_1 = require("../client_communication/user_manager");
const systems_communication_1 = require("../systems_communication");
var Effect;
(function (Effect) {
    let Update;
    (function (Update) {
        function cell_market(cell) {
            const locals = cell.get_characters_list();
            for (let item of locals) {
                const id = item.id;
                const local_character = systems_communication_1.Convert.id_to_character(id);
                user_manager_1.UserManagement.add_user_to_update_queue(local_character.user_id, 20 /* UI_Part.MARKET */);
            }
        }
        Update.cell_market = cell_market;
    })(Update = Effect.Update || (Effect.Update = {}));
})(Effect = exports.Effect || (exports.Effect = {}));
