"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Update = void 0;
const updates_1 = require("./network_actions/updates");
const children = {
    [0 /* UI_Part.ROOT */]: [8 /* UI_Part.COOKING_ELO */, 2 /* UI_Part.STATUS */, 6 /* UI_Part.SKILLS */, 5 /* UI_Part.INVENTORY */, 4 /* UI_Part.SAVINGS */, 3 /* UI_Part.STASH */],
    [1 /* UI_Part.HP */]: [],
    [2 /* UI_Part.STATUS */]: [1 /* UI_Part.HP */],
    [3 /* UI_Part.STASH */]: [],
    [4 /* UI_Part.SAVINGS */]: [],
    [5 /* UI_Part.INVENTORY */]: [],
    [6 /* UI_Part.SKILLS */]: [7 /* UI_Part.COOKING_SKILL */],
    [7 /* UI_Part.COOKING_SKILL */]: [],
    [8 /* UI_Part.COOKING_ELO */]: []
};
function empty_function(user) { }
const update_function = {
    [0 /* UI_Part.ROOT */]: empty_function,
    [1 /* UI_Part.HP */]: updates_1.SendUpdate.hp,
    [2 /* UI_Part.STATUS */]: updates_1.SendUpdate.status,
    [3 /* UI_Part.STASH */]: updates_1.SendUpdate.stash,
    [4 /* UI_Part.SAVINGS */]: updates_1.SendUpdate.savings,
    [5 /* UI_Part.INVENTORY */]: updates_1.SendUpdate.equip,
    [6 /* UI_Part.SKILLS */]: updates_1.SendUpdate.all_skills,
    [7 /* UI_Part.COOKING_SKILL */]: updates_1.SendUpdate.skill_cooking,
    [8 /* UI_Part.COOKING_ELO */]: updates_1.SendUpdate.cook_elo
};
const influence = {
    [0 /* UI_Part.ROOT */]: [],
    [1 /* UI_Part.HP */]: [],
    [2 /* UI_Part.STATUS */]: [],
    [3 /* UI_Part.STASH */]: [],
    [4 /* UI_Part.SAVINGS */]: [],
    [5 /* UI_Part.INVENTORY */]: [],
    [6 /* UI_Part.SKILLS */]: [],
    [7 /* UI_Part.COOKING_SKILL */]: [8 /* UI_Part.COOKING_ELO */],
    [8 /* UI_Part.COOKING_ELO */]: []
};
// if node: ask to update node and leave
// else: try updating children
// NOTE: node updates are expected to send relevant data of their children
// because sometimes it's simpler to send data as a whole than by parts
// 
// i could force update of all children on all affected nodes instead, but will check how current setup will play out
var Update;
(function (Update) {
    function on(something, part) {
        let queue = [part];
        let l = 0;
        let r = 1;
        while (r > l) {
            let current = queue[l];
            if (!something[current]) {
                something[current] = true;
                for (let i of influence[current]) {
                    queue.push(i);
                    r += 1;
                }
            }
            l += 1;
        }
    }
    Update.on = on;
    function clear(something) {
        for (let i in something) {
            something[Number(i)] = false;
        }
    }
    Update.clear = clear;
    function update(current, user, force_update) {
        if (force_update || (user.updates[current])) {
            update_function[current];
            return;
        }
        for (let i of children[current]) {
            update(i, user, false);
        }
    }
    Update.update = update;
    function update_root(user) {
        update(0 /* UI_Part.ROOT */, user, false);
    }
    Update.update_root = update_root;
    function construct() {
        return {
            [0 /* UI_Part.ROOT */]: false,
            [1 /* UI_Part.HP */]: false,
            [2 /* UI_Part.STATUS */]: false,
            [3 /* UI_Part.STASH */]: false,
            [4 /* UI_Part.SAVINGS */]: false,
            [5 /* UI_Part.INVENTORY */]: false,
            [6 /* UI_Part.SKILLS */]: false,
            [7 /* UI_Part.COOKING_SKILL */]: false,
            [8 /* UI_Part.COOKING_ELO */]: false,
        };
    }
    Update.construct = construct;
})(Update = exports.Update || (exports.Update = {}));
