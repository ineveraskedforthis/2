"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIActionsStorage = void 0;
class AIActionsStorage {
    static register_action_location(action) {
        this.Location.push(action);
        return action;
    }
    static register_action_character(action) {
        this.Character.push(action);
        return action;
    }
    static register_action_cell(action) {
        this.Cell.push(action);
        return action;
    }
    static register_action_self(action) {
        this.Self.push(action);
        return action;
    }
    static register_action_material(action) {
        this.Material.push(action);
        return action;
    }
    static get actions() {
        const result = [];
        return result.concat(this.Location, this.Character, this.Cell, this.Self, this.Material);
    }
}
exports.AIActionsStorage = AIActionsStorage;
AIActionsStorage.Location = [];
AIActionsStorage.Character = [];
AIActionsStorage.Cell = [];
AIActionsStorage.Self = [];
AIActionsStorage.Material = [];
