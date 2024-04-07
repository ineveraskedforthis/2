import { Socket } from "../../../shared/battle_data.js";
import { BarValue } from "../Values/collection.js";

const bar_value_tags = ["hp", "rage", "blood", "stress", "fatigue"]

export class CharacterInfoCorner {
    data: Record<string, BarValue>
    constructor(socket: Socket) {
        this.data = {}
        for (const item of bar_value_tags) {
            this.data[item] = new BarValue(socket, item)
        }
    }
}