import { tagRACE } from "../types"

export function hostile(actor: tagRACE, target: tagRACE):boolean {
    switch(actor) {
        case 'human': if (target == 'rat') {return true} else {return false}
        case 'rat': if (target == 'human') {return true} else {return false}
        case 'elo': return false
        case 'graci': return false
        case "ball": return false
    }
}