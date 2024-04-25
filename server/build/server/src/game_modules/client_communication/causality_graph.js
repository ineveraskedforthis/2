"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Update = void 0;
const updates_1 = require("./network_actions/updates");
const children = {
    [0 /* UI_Part.ROOT */]: [1 /* UI_Part.STATUS */,
        7 /* UI_Part.BELONGINGS */,
        11 /* UI_Part.MAP */,
        16 /* UI_Part.SKILLS */,
        20 /* UI_Part.CRAFT */,
        21 /* UI_Part.BATTLE */,
        22 /* UI_Part.MARKET */,
        23 /* UI_Part.STATS */],
    [1 /* UI_Part.STATUS */]: [2 /* UI_Part.HP */, 5 /* UI_Part.FATIGUE */, 3 /* UI_Part.STRESS */, 6 /* UI_Part.RAGE */, 4 /* UI_Part.BLOOD */],
    [7 /* UI_Part.BELONGINGS */]: [8 /* UI_Part.STASH */,
        9 /* UI_Part.SAVINGS */,
        10 /* UI_Part.INVENTORY */],
    [11 /* UI_Part.MAP */]: [13 /* UI_Part.LOCAL_CHARACTERS */,
        15 /* UI_Part.LOCAL_ACTIONS */,
        14 /* UI_Part.EXPLORED */,
        12 /* UI_Part.MAP_POSITION */],
    [12 /* UI_Part.MAP_POSITION */]: [13 /* UI_Part.LOCAL_CHARACTERS */,
        15 /* UI_Part.LOCAL_ACTIONS */,
        14 /* UI_Part.EXPLORED */],
    [16 /* UI_Part.SKILLS */]: [17 /* UI_Part.COOKING_SKILL */,
        19 /* UI_Part.SKINNING_SKILL */,
        18 /* UI_Part.DEFENCE_SKILL */],
    // [UI_Part.CRAFT]                 : [ UI_Part.COOKING_CRAFT]
};
function empty_function(user) { }
const update_function = {
    [0 /* UI_Part.ROOT */]: updates_1.SendUpdate.all,
    [1 /* UI_Part.STATUS */]: updates_1.SendUpdate.status,
    [2 /* UI_Part.HP */]: updates_1.SendUpdate.hp,
    [4 /* UI_Part.BLOOD */]: updates_1.SendUpdate.blood,
    [3 /* UI_Part.STRESS */]: updates_1.SendUpdate.stress,
    [5 /* UI_Part.FATIGUE */]: updates_1.SendUpdate.fatigue,
    [6 /* UI_Part.RAGE */]: updates_1.SendUpdate.rage,
    [7 /* UI_Part.BELONGINGS */]: updates_1.SendUpdate.belongings,
    [8 /* UI_Part.STASH */]: updates_1.SendUpdate.stash,
    [9 /* UI_Part.SAVINGS */]: updates_1.SendUpdate.savings,
    [10 /* UI_Part.INVENTORY */]: updates_1.SendUpdate.equip,
    [11 /* UI_Part.MAP */]: updates_1.SendUpdate.map_related,
    [12 /* UI_Part.MAP_POSITION */]: updates_1.SendUpdate.map_position_move,
    [15 /* UI_Part.LOCAL_ACTIONS */]: updates_1.SendUpdate.local_actions,
    [13 /* UI_Part.LOCAL_CHARACTERS */]: updates_1.SendUpdate.local_characters,
    [14 /* UI_Part.EXPLORED */]: updates_1.SendUpdate.explored,
    [16 /* UI_Part.SKILLS */]: updates_1.SendUpdate.all_skills,
    [17 /* UI_Part.COOKING_SKILL */]: updates_1.SendUpdate.skill_cooking,
    [19 /* UI_Part.SKINNING_SKILL */]: updates_1.SendUpdate.skill_skinning,
    [18 /* UI_Part.DEFENCE_SKILL */]: updates_1.SendUpdate.skill_defence,
    [20 /* UI_Part.CRAFT */]: updates_1.SendUpdate.all_craft,
    [21 /* UI_Part.BATTLE */]: updates_1.SendUpdate.battle,
    [22 /* UI_Part.MARKET */]: updates_1.SendUpdate.market,
    [23 /* UI_Part.STATS */]: updates_1.SendUpdate.stats,
};
const influence = {
    [16 /* UI_Part.SKILLS */]: [20 /* UI_Part.CRAFT */, 23 /* UI_Part.STATS */],
    [10 /* UI_Part.INVENTORY */]: [23 /* UI_Part.STATS */],
    [7 /* UI_Part.BELONGINGS */]: [23 /* UI_Part.STATS */],
    [1 /* UI_Part.STATUS */]: [23 /* UI_Part.STATS */, 16 /* UI_Part.SKILLS */]
    // [UI_Part.COOKING_SKILL]     : [UI_Part.COOKING_CRAFT],
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
            // console.log('activate ' + current + ' ' + UI_Part[current])
            if (!something[current]) {
                something[current] = true;
                const inf = influence[current];
                if (inf != undefined)
                    for (let i of inf) {
                        queue.push(i);
                        r += 1;
                    }
            }
            l += 1;
        }
    }
    Update.on = on;
    // export function clear(something: update_flags) : void {
    //     console.log('clear flags')
    //     for (let i in something) {
    //         something[Number(UI_Part[i]) as UI_Part] = false
    //     }
    // }
    function update(current, user, force_update) {
        // console.log(force_update)
        // console.log(user.updates[current])
        if (force_update || (user.updates[current])) {
            // console.log('updating ' + current + ' ' + current)
            update_function[current](user);
            return;
        }
        const ch = children[current];
        if (ch == undefined) {
            return;
        }
        for (let i of ch) {
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
        };
    }
    Update.construct = construct;
})(Update || (exports.Update = Update = {}));
