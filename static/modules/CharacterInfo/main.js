import { BarValue } from "../Values/collection.js";
const bar_value_tags = ["hp", "rage", "blood", "stress", "fatigue"];
export class CharacterInfoCorner {
    constructor(socket) {
        this.data = {};
        for (const item of bar_value_tags) {
            this.data[item] = new BarValue(socket, item, []);
        }
    }
}
