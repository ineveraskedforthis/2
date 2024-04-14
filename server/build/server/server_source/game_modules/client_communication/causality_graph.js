"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Update = void 0;
const updates_1 = require("./network_actions/updates");
const children = {
    [0 /* UI_Part.ROOT */]: [1 /* UI_Part.STATUS */,
        3 /* UI_Part.BELONGINGS */,
        7 /* UI_Part.MAP */,
        12 /* UI_Part.SKILLS */,
        17 /* UI_Part.CRAFT */,
        18 /* UI_Part.BATTLE */,
        19 /* UI_Part.MARKET */,
        20 /* UI_Part.STATS */],
    [1 /* UI_Part.STATUS */]: [2 /* UI_Part.HP */],
    [3 /* UI_Part.BELONGINGS */]: [4 /* UI_Part.STASH */,
        5 /* UI_Part.SAVINGS */,
        6 /* UI_Part.INVENTORY */],
    [7 /* UI_Part.MAP */]: [9 /* UI_Part.LOCAL_CHARACTERS */,
        11 /* UI_Part.LOCAL_ACTIONS */,
        10 /* UI_Part.EXPLORED */,
        8 /* UI_Part.MAP_POSITION */],
    [8 /* UI_Part.MAP_POSITION */]: [9 /* UI_Part.LOCAL_CHARACTERS */,
        11 /* UI_Part.LOCAL_ACTIONS */,
        10 /* UI_Part.EXPLORED */],
    [12 /* UI_Part.SKILLS */]: [13 /* UI_Part.COOKING_SKILL */,
        16 /* UI_Part.SKINNING_SKILL */,
        15 /* UI_Part.WEAPON_SKILL */,
        14 /* UI_Part.DEFENCE_SKILL */],
    // [UI_Part.CRAFT]                 : [ UI_Part.COOKING_CRAFT]
};
function empty_function(user) { }
const update_function = {
    [0 /* UI_Part.ROOT */]: updates_1.SendUpdate.all,
    [1 /* UI_Part.STATUS */]: updates_1.SendUpdate.status,
    [2 /* UI_Part.HP */]: updates_1.SendUpdate.hp,
    [3 /* UI_Part.BELONGINGS */]: updates_1.SendUpdate.belongings,
    [4 /* UI_Part.STASH */]: updates_1.SendUpdate.stash,
    [5 /* UI_Part.SAVINGS */]: updates_1.SendUpdate.savings,
    [6 /* UI_Part.INVENTORY */]: updates_1.SendUpdate.equip,
    [7 /* UI_Part.MAP */]: updates_1.SendUpdate.map_related,
    [8 /* UI_Part.MAP_POSITION */]: updates_1.SendUpdate.map_position_move,
    [11 /* UI_Part.LOCAL_ACTIONS */]: updates_1.SendUpdate.local_actions,
    [9 /* UI_Part.LOCAL_CHARACTERS */]: updates_1.SendUpdate.local_characters,
    [10 /* UI_Part.EXPLORED */]: updates_1.SendUpdate.explored,
    [12 /* UI_Part.SKILLS */]: updates_1.SendUpdate.all_skills,
    [13 /* UI_Part.COOKING_SKILL */]: updates_1.SendUpdate.skill_cooking,
    [16 /* UI_Part.SKINNING_SKILL */]: updates_1.SendUpdate.skill_skinning,
    [14 /* UI_Part.DEFENCE_SKILL */]: updates_1.SendUpdate.skill_defence,
    [15 /* UI_Part.WEAPON_SKILL */]: updates_1.SendUpdate.skill_weapon,
    [17 /* UI_Part.CRAFT */]: updates_1.SendUpdate.all_craft,
    // [UI_Part.COOKING_CRAFT]     : SendUpdate.cooking_craft,
    [18 /* UI_Part.BATTLE */]: updates_1.SendUpdate.battle,
    // [UI_Part.BATTLE_ACTIONS]    : SendUpdate.battle_actions,
    [19 /* UI_Part.MARKET */]: updates_1.SendUpdate.market,
    [20 /* UI_Part.STATS */]: updates_1.SendUpdate.stats,
};
const influence = {
    [12 /* UI_Part.SKILLS */]: [17 /* UI_Part.CRAFT */, 20 /* UI_Part.STATS */],
    [6 /* UI_Part.INVENTORY */]: [20 /* UI_Part.STATS */],
    [3 /* UI_Part.BELONGINGS */]: [20 /* UI_Part.STATS */],
    [1 /* UI_Part.STATUS */]: [20 /* UI_Part.STATS */, 12 /* UI_Part.SKILLS */]
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
            update_function[current](user); //return
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

