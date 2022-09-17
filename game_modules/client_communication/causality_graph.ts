import { User } from "./user"
import { SendUpdate } from "./network_actions/updates";

var last_index = 0

class Node {
    id: number;
    edges_out: Node[]
    sender: (u: User) => void

    constructor(sender: (u: User) => void) {
        this.edges_out = []
        this.sender = sender
    }

    activate(u: User) {
        
    }
}

function edge(a: Node, b: Node) {
    a.edges_out.push(b)
}


const cooking           = new Node(SendUpdate.skill_cooking)
const cook_elo          = new Node(SendUpdate.cook_elo)
const all_skills        = new Node(SendUpdate.all_skills)
const savings           = new Node(SendUpdate.savings)
const stash             = new Node(SendUpdate.stash)
const status            = new Node(SendUpdate.status)
// const inventory         = new Node(SendUpdate.)



edge(cooking, cook_elo)
edge(all_skills, cooking)

