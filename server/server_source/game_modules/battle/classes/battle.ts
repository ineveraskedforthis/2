import { BattleEventSocket, battle_id, ms } from "../../../../../shared/battle_data";
import { UnitsHeap } from "./heap";


export class Battle {
    heap: UnitsHeap;
    id: battle_id;
    waiting_for_input: boolean;
    date_of_last_turn: ms|'%';
    ended: boolean
    turn_ended: boolean
    last_event_index: number
    grace_period: number

    battle_history: BattleEventSocket[]

    ai_timer?: ms

    constructor(id: battle_id, heap: UnitsHeap) {
        this.heap = heap
        this.id = id
        this.date_of_last_turn = '%'
        this.waiting_for_input = false
        this.ended = false
        this.turn_ended = true
        this.last_event_index = 0
        this.grace_period = 0

        this.battle_history = []
    }
}
