import { tagRACE } from "../character_generic_part";

export function hostile(actor: tagRACE, target: tagRACE):boolean {
    switch(actor) {
        case 'test': if (target == 'rat') {return true} else {return false}
        case 'human': if (target == 'rat') {return true} else {return false}
        case 'rat': if ((target == 'test')||(target == 'human')) {return true} else {return false}
        case 'elo': return false
        case 'graci': return false
    }
}