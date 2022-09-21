import { User } from "./user"
import { SendUpdate } from "./network_actions/updates";


type mask = number & {__brand: 'mask'}


// should rewrite later to classes/interfaces?
// but they will add even more boilerplate......................

const enum UI_Part {
    ROOT, HP, STATUS, STASH, SAVINGS, INVENTORY, SKILLS, CRAFT, COOKING_SKILL, COOKING_CRAFT, 
}

const children:{[_ in UI_Part]: UI_Part[]} = {
    [UI_Part.ROOT]              : [UI_Part.COOKING_CRAFT, UI_Part.STATUS, UI_Part.SKILLS, UI_Part.INVENTORY, UI_Part.SAVINGS, UI_Part.STASH],
    [UI_Part.HP]                : [],
    [UI_Part.STATUS]            : [UI_Part.HP],
    [UI_Part.STASH]             : [],
    [UI_Part.SAVINGS]           : [],
    [UI_Part.INVENTORY]         : [],
    [UI_Part.SKILLS]            : [UI_Part.COOKING_SKILL],
    [UI_Part.CRAFT]             : [UI_Part.COOKING_CRAFT],
    [UI_Part.COOKING_SKILL]     : [],
    [UI_Part.COOKING_CRAFT]     : []
}

function empty_function(user: User) {}

const update_function: {[_ in UI_Part]: ((user: User) => void)} = {
    [UI_Part.ROOT]              : SendUpdate.all,
    [UI_Part.HP]                : SendUpdate.hp,
    [UI_Part.STATUS]            : SendUpdate.status,
    [UI_Part.STASH]             : SendUpdate.stash,
    [UI_Part.SAVINGS]           : SendUpdate.savings,
    [UI_Part.INVENTORY]         : SendUpdate.equip,
    [UI_Part.SKILLS]            : SendUpdate.all_skills,
    [UI_Part.CRAFT]             : SendUpdate.all_craft,
    [UI_Part.COOKING_SKILL]     : SendUpdate.skill_cooking,
    [UI_Part.COOKING_CRAFT]     : SendUpdate.cooking_craft
}

const influence:{[_ in UI_Part]: UI_Part[]} = {
    [UI_Part.ROOT]              : [],
    [UI_Part.HP]                : [],
    [UI_Part.STATUS]            : [],
    [UI_Part.STASH]             : [],
    [UI_Part.SAVINGS]           : [],
    [UI_Part.INVENTORY]         : [],
    [UI_Part.SKILLS]            : [UI_Part.CRAFT],
    [UI_Part.CRAFT]             : [],
    [UI_Part.COOKING_SKILL]     : [UI_Part.COOKING_CRAFT],
    [UI_Part.COOKING_CRAFT]     : []
}

export type update_flags = {[_ in UI_Part]: boolean} 


// if node: ask to update node and leave
// else: try updating children
// NOTE: node updates are expected to send relevant data of their children
// because sometimes it's simpler to send data as a whole than by parts
// 
// i could force update of all children on all affected nodes instead, but will check how current setup will play out
export namespace Update {
    export function on(something: update_flags, part: UI_Part): void {
        let queue: UI_Part[] = [part]
        let l = 0
        let r = 1
        while (r > l) {
            let current = queue[l]
            if (!something[current]) {
                something[current] = true
                for (let i of influence[current]) {
                    queue.push(i)
                    r += 1
                }
            }
            l += 1
        }
    }
    export function clear(something: update_flags) : void {
        for (let i in something) {
            something[Number(i) as UI_Part] = false
        }
    }
    export function update(current: UI_Part, user: User, force_update: boolean) {
        if (force_update || (user.updates[current])) {update_function[current]; return}
        for (let i of children[current]) {
            update(i, user, false)
        }
    }

    export function update_root(user: User) {
        update(UI_Part.ROOT, user, false)
    }

    export function construct() : update_flags {
        return  {
            [UI_Part.ROOT]              : false,
            [UI_Part.HP]                : false,
            [UI_Part.STATUS]            : false,
            [UI_Part.STASH]             : false,
            [UI_Part.SAVINGS]           : false,
            [UI_Part.INVENTORY]         : false,
            [UI_Part.SKILLS]            : false,
            [UI_Part.COOKING_SKILL]     : false,
            [UI_Part.COOKING_CRAFT]     : false,
            [UI_Part.CRAFT]             : false,
        }
    }
}