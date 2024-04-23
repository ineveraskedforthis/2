import { character_id } from "@custom_types/ids";
import { BattleKeyframeSocket, battle_id, ms } from "../../../../../shared/battle_data";
import { DataID } from "../../data/data_id";

interface DelayedJoin {
    delay: number,
    character: character_id
}

interface BattleHeap {
    last: number;
    heap: (character_id|undefined)[];
    queue: DelayedJoin[]
}

export class Battle implements BattleHeap {
    last: number;
    heap: (character_id|undefined)[];
    queue: DelayedJoin[];

    id: battle_id;
    waiting_for_input: boolean;
    date_of_last_turn: ms|'%';
    last_event_index: number
    grace_period: number
    stopped: boolean

    battle_history: BattleKeyframeSocket[]

    ai_timer?: ms

    constructor(id: battle_id|undefined ) {
        this.last = 0
        this.heap = []
        this.queue = []

        if (id == undefined) {
            this.id = DataID.Battle.new_id()
        } else {
            DataID.Battle.register(id, [])
            this.id = id
        }

        this.date_of_last_turn = '%'
        this.waiting_for_input = false
        this.last_event_index = 0
        this.grace_period = 10
        this.stopped = false

        this.battle_history = []
    }
}
