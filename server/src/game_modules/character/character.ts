import { Stash } from "../inventories/stash"
import { Equip } from "../inventories/equip";
import { Savings} from "../inventories/savings";
import { CharacterTemplate, model_interface_name, ModelVariant, skeleton, Status, tagAI, tagModel, tagRACE, tagTactic } from "../types";
import { status_type, money } from "@custom_types/common";
import { location_id, character_id, user_id, cell_id } from "@custom_types/ids";
import { SkillList } from "./SkillList";
import { AImemory, AIstate } from "./AIstate";
import { CharacterMapAction } from "../actions/types";
import { MaxHP, MaxHPTag } from "../races/max_hp";
import { BaseResistTag } from "../races/resists";
import { StatsTag } from "../races/stats";
import { trim } from "../calculations/basic_functions";
import { ItemSystem } from "../systems/items/item_system";
import { DataID } from "../data/data_id";
import { PerksTable, TraitsTable } from "@custom_types/character";
import { action_points, battle_id, battle_position } from "@custom_types/battle_data";
import { EQUIP_SLOT, EquipSlotConfiguration, IMPACT_TYPE, MATERIAL } from "@content/content";
import { Data } from "../data/data_objects";

export class Character {
    id: character_id;

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

    explored: Partial<Record<cell_id, boolean>>;
    next_cell: cell_id

    ai_state: AIstate;
    ai_memories: AImemory[];
    ai_price_belief_sell: Map<MATERIAL, money>;
    ai_price_belief_buy: Map<MATERIAL, money>;

    action: CharacterMapAction|undefined
    action_progress: number
    action_duration: number

    model_variation: any;

    action_points_left: action_points;
    action_points_max: action_points;
    next_turn_after: number;
    dodge_turns: number;
    position: battle_position;
    team: number

    constructor(
        id: character_id|undefined,
        battle_id: battle_id|undefined,
        user_id: user_id|undefined,
        location_id: location_id,
        name: string,
        template: CharacterTemplate
    ) {
        console.log(id, location_id)

        if (id == undefined) {
            this.id = DataID.Character.new_id(location_id)
        } else {
            this.id = id
            DataID.Character.register(id, location_id)
        }

        this.battle_id = battle_id
        this.user_id = user_id
        this.next_cell = 0 as cell_id

        this.name = name

        this.model = template.model
        this.ai_map = template.ai_map
        this.ai_battle = template.ai_battle
        this.race = template.race
        this.stats = template.stats
        this.resists = template.resists
        this.max_hp = template.max_hp

        this.location_id = location_id

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

        this.action_points_left = 0 as action_points
        this.action_points_max = 10 as action_points


        this.next_turn_after = 1
        this.position = {
            x: 0,
            y: 0
        } as battle_position

        this.team = 0
        this.dodge_turns = 0

        this.explored = []
    }

    set battle_id(x: battle_id|undefined){
        DataID.Connection.set_character_battle(this.id, x)
    }

    get battle_id(){
        return DataID.Character.battle_id(this.id)
    }

    set user_id(x: user_id| undefined){
        DataID.Connection.set_character_user(this.id, x)
    }

    get user_id(){
        return DataID.Character.user_id(this.id)
    }

    set location_id(location: location_id) {
        DataID.Connection.set_character_location(this.id, location)
    }

    get location_id() {
        return DataID.Character.location_id(this.id)
    }

    set home_location_id(location: location_id|undefined) {
        DataID.Connection.set_character_home(this.id, location)
    }

    get home_location_id() {
        return DataID.Character.home_location_id(this.id)
    }

    get cell_id() {
        return DataID.Location.cell_id(this.location_id)
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
        let weapon = this.equip.weapon
        if (weapon != undefined) {
            let result = ItemSystem.range(weapon)
            if (weapon.prototype.impact == IMPACT_TYPE.POINT) {
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

    equip_models():{[_ in EQUIP_SLOT]?: string}  {
        let response:{[_ in EQUIP_SLOT]?: string} = {}
        for (let k of EquipSlotConfiguration.SLOT) {
            const item_id = this.equip.data.slots[k]
            if (item_id == undefined) continue
            const item_data = Data.Items.from_id(item_id)
            response[k] = item_data.prototype.id_string
        }
        return response
    }

    is_player()     { return this.user_id != undefined }
    dead()          { return this.get_hp() == 0 }
    in_battle()     { return (this.battle_id != undefined) }

    get slowness() {
        return 100
    }

    get action_units_per_turn() {
        return 4
    }
}