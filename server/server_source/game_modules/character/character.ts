import {Stash} from "../inventories/stash"
// import { PerksTable } from "./Perks";
import { Equip } from "../inventories/equip";
import { Savings} from "../inventories/savings";
import { building_id, char_id, CharacterTemplate, model_interface_name, ModelVariant, skeleton, Status, status_type, tagAI, tagModel, tagRACE, tagTactic, TEMP_USER_ID, user_id } from "../types";
import { battle_id, unit_id } from "../../../../shared/battle_data";
import { SkillList } from "./SkillList";
import { AImemory, AIstate } from "./AIstate";
import { material_index } from "@custom_types/inventory";
import { PerksTable, TraitsTable } from "../../../../shared/character";
import { cell_id, money } from "../../../../shared/common";
import { CharacterMapAction } from "../actions/types";
import { equip_slot } from "@custom_types/inventory";
import { MaxHP, MaxHPTag } from "../races/max_hp";
import { BaseResistTag } from "../races/resists";
import { BaseStats, StatsTag } from "../races/stats";
import { trim } from "../calculations/basic_functions";
import { ItemSystem } from "../items/system";

export class Character {
    id: char_id;

    battle_id: battle_id|undefined;
    battle_unit_id: unit_id|undefined;

    user_id: user_id|TEMP_USER_ID;
    cell_id: cell_id;
    home_cell_id?: cell_id;
    current_building: building_id|undefined;

    name: string;

    equip: Equip;

    stash: Stash;
    trade_stash: Stash;

    savings: Savings;
    trade_savings: Savings;

    status: Status;

    cleared: boolean;
    skinned?: boolean;
    bones_removed?: boolean;

    _skills: SkillList;
    _perks: PerksTable;
    _traits: TraitsTable;
    // stats: InnateStats;

    model: tagModel;
    ai_map: tagAI;
    ai_battle: tagTactic;
    race: tagRACE;
    stats: StatsTag;
    resists: BaseResistTag;
    max_hp: MaxHPTag;

    explored: boolean[];
    next_cell: cell_id

    ai_state: AIstate;
    ai_memories: AImemory[];
    ai_price_belief_sell: Map<material_index, money>;
    ai_price_belief_buy: Map<material_index, money>;

    action: CharacterMapAction|undefined
    action_progress: number
    action_duration: number

    model_variation: any;

    constructor(
        id: number,
        battle_id: battle_id|undefined,
        battle_unit_id: unit_id|undefined,
        user_id: user_id|TEMP_USER_ID,
        cell_id: cell_id,
        name: string,
        template: CharacterTemplate
    ) {

        this.id = id as char_id
        this.battle_id = battle_id
        this.battle_unit_id = battle_unit_id
        this.user_id = user_id
        this.cell_id = cell_id
        this.next_cell = 0 as cell_id

        this.name = name

        // this.archetype = Object.assign({}, archetype)

        // model: tagModel;
        // ai_map: tagAI;
        // ai_battle: tagTactic;
        // race: tagRACE;
        // stats: StatsTag;
        // resists: BaseResistTag;
        // max_hp: MaxHPTag;

        this.model = template.model
        this.ai_map = template.ai_map
        this.ai_battle = template.ai_battle
        this.race = template.race
        this.stats = template.stats
        this.resists = template.resists
        this.max_hp = template.max_hp


        // let max_hp = MaxHP[template.max_hp]

        this.current_building = undefined

        this.equip = new Equip()
        this.stash = new Stash()
        this.trade_stash = new Stash()
        this.savings = new Savings()
        this.trade_savings = new Savings()

        this.status = new Status()
        this.status.blood = 0
        this.status.fatigue = 0
        this.status.rage = 0
        this.status.hp = MaxHP[template.max_hp]
        this.status.stress = 0

        this.cleared = false

        this.action_progress = 0
        this.action_duration = 0

        this.ai_state = AIstate.Idle;
        this.ai_memories = []
        this.ai_price_belief_buy = new Map()
        this.ai_price_belief_sell = new Map()

        this._skills = new SkillList()
        this._perks = {}
        this._traits = {}

        this.explored = []
    }

    set_model_variation(data:ModelVariant) {
        this.model_variation = data
    }

    /**
     * Changes the status of a given type by a specified amount and returns a boolean indicating success.
     *
     * @param {status_type} type - the type of status to change
     * @param {number} x - the amount to change the status by
     * @return {boolean} true if the status was successfully changed, false if the new value is the same as the old value
     */
    change(type: status_type, x: number):boolean {
        let tmp = this.status[type];
        let new_status = tmp + x
        let max = 100
        if (type == 'hp') {
            max = MaxHP[this.max_hp]
        }
        new_status = trim(new_status, 0, max)
        return this.set(type, new_status)
    }


    get_name() {
        if (!this.dead()) return this.name
        if (this.skinned != true) {
            return `Corpse of ${model_interface_name(this.model)}`
        }
        if (skeleton(this.model) && (this.bones_removed != true)) {
            return `Skeleton of ${model_interface_name(this.model)}`
        }
        return `Traces of something`
    }

    change_hp(x: number) {
        return this.change('hp', x)
    }

    change_rage(x: number) {
        return this.change('rage', x)
    }

    change_blood(x: number) {
        return this.change('blood', x)
    }

    /**
     * Changes the fatigue level by the given amount.
     *
     * @param {number} x - The amount to change the fatigue level by.
     * @return {boolean} - False if fatigue was not changed, true if it was.
     */
    change_fatigue(x: number) {
        return this.change('fatigue', x)
    }

    /**
     * Changes the stress level by the given amount.
     *
     * @param {number} x - The amount to change the stress level by.
     * @return {boolean} - False if stress was not changed, true if it was.
     */
    change_stress(x: number) {
        return this.change('stress', x)
    }

    /**
    * Sets the value of a status type to a given number.
    *
    * @param {status_type} type - The type of status to set.
    * @param {number} x - The value to set the status to.
    * @return {boolean} Returns true if the value was set successfully, false if the value had not changed.
    */
    set(type: status_type, x: number):boolean {
        if (this.status[type] == x) return false
        this.status[type] = x
        return true
    }

    set_fatigue(x: number) {
        return this.set('fatigue', x)
    }

    set_status(dstatus: Status) {
        this.status.blood = dstatus.blood
        this.status.rage = dstatus.rage
        this.status.stress = dstatus.stress
        this.status.hp = dstatus.hp
        this.status.fatigue = dstatus.fatigue
    }

    change_status(dstatus: Status) {
        this.change_hp(dstatus.hp)
        this.change_rage(dstatus.rage);
        this.change_stress(dstatus.stress);
        this.change_blood(dstatus.blood);
        this.change_fatigue(dstatus.fatigue)
    }

    get_hp() {
        return this.status.hp
    }
    get_max_hp() {
        return MaxHP[this.max_hp]
    }
    get_blood() {
        return this.status.blood
    }
    get_rage() {
        return this.status.rage
    }
    get_fatigue() {
        return this.status.fatigue
    }
    get_stress() {
        return this.status.stress
    }

    range() {
        let weapon = this.equip.data.slots.weapon
        if (weapon != undefined) {
            let result = ItemSystem.range(weapon)
            if (ItemSystem.weapon_tag(weapon) == 'polearms') {
                if (this._perks.advanced_polearm) {
                    result += 0.5
                }
            }
            return result
        }
        if (this.race == 'graci') return 2;
        if (this.model == 'bigrat') return 1
        if (this.model == 'elo') return 1
        return 0.5
    }

    equip_models():{[_ in equip_slot]?: string}  {
        let response:{[_ in equip_slot]?: string} = {}
        for (let [k, v] of Object.entries(this.equip.data.slots)) {
            response[k as equip_slot] = v?.model_tag
        }
        return response
    }

    is_player()     { return this.user_id != '#' }
    dead()          { return this.get_hp() == 0 }
    in_battle()     { return (this.battle_id != undefined) }
}