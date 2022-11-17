import { battle_position, UnitSocket, unit_id } from "../../../shared/battle_data"
import { BattleImage, units_views } from "./battle_image";
import { position_c } from "./battle_image_helper";
import { BattleUnitView } from "./battle_view";
import { BATTLE_MOVEMENT_SPEED } from "./constants";

function new_log_message(msg: string) {
    if (msg == null) {
        return
    }
    if (msg == 'ok') return;
    var log = document.getElementById('log')!;
    var new_line = document.createElement('p');
    var text = document.createTextNode(msg);
    new_line.append(text);
    log.appendChild(new_line);
    log.scrollTop = log.scrollHeight
}

export class BattleImageEvent {
    // ap_before: number
    ap_change_left: number
    ap_change: number
    hp_change_left: number
    hp_change: number
    unit: unit_id
    logged: boolean

    constructor(unit_id: unit_id, ap_change: number, hp_change: number) {
        this.unit = unit_id
        this.ap_change = ap_change
        this.ap_change_left = ap_change
        this.hp_change = hp_change
        this.hp_change_left = hp_change
        this.logged = false
        // this.ap_before = unit.ap
    }

    /**
     * returns true if effect is finished
     * @param dt number: time passed
     */
    effect(dt: number): boolean {
        return true
    }
}

export class MoveEvent extends BattleImageEvent {
    target_position: battle_position;
    total_distance: number;

    constructor(unit_id: unit_id, ap_spent: number, target: battle_position) {
        super(unit_id, ap_spent, 0)        
        this.target_position = target
        const unit = units_views[this.unit]
        let direction = position_c.diff(unit.position, this.target_position)
        let norm = position_c.norm(direction)
        this.total_distance = norm
    }

    effect(dt: number): boolean {
        if (!this.logged) {
            let unit = units_views[this.unit]
            let message = unit.name + ' moved (' + this.target_position.x + ' ' + this.target_position.y + ')'
            new_log_message(message)
            this.logged = true
        }

        const unit = units_views[this.unit]
        let direction = position_c.diff(unit.position, this.target_position)
        let norm = position_c.norm(direction)

        const move = position_c.scalar_mult(BATTLE_MOVEMENT_SPEED / norm * dt, direction)

        if (norm < BATTLE_MOVEMENT_SPEED * dt) {
            this.ap_change_left = 0
            unit.position = this.target_position
            unit.a_image.set_action('idle')
            return true
        } else {
            this.ap_change_left = this.ap_change * (norm / this.total_distance)
            unit.position = position_c.sum( unit.position, move )
                
            unit.a_image.set_action('move')
            return false
        }
    }
}

const INSTANT_EVENT_DURATION = 2 //seconds

export class NewUnitEvent extends BattleImageEvent {
    type: 'update'
    unit: unit_id
    time_passed: number
    data: UnitSocket

    constructor(unit_id: unit_id, data: UnitSocket) {
        super(unit_id, 0, 0)
        this.unit = unit_id
        this.data = data
        this.type = 'update'
        this.time_passed = 0
    }

    effect(dt: number) {
        if (!this.logged) {
            let unit = units_views[this.unit]
            BattleImage.load_unit(this.data)
            new_log_message('new fighter: ' + unit.name)
            this.logged = true
        }
        
        return true
    }
}

export class UpdateDataEvent extends BattleImageEvent {
    type: 'update'
    unit: unit_id
    time_passed: number
    data: UnitSocket

    constructor(unit_id: unit_id, data: UnitSocket) {
        super(unit_id, 0, 0)
        this.unit = unit_id
        this.data = data
        this.type = 'update'
        this.time_passed = 0
    }

    effect(dt: number) {
        let unit = units_views[this.unit]
        if (!this.logged) {
            new_log_message('update data of ' + unit.name)
            this.ap_change = this.data.ap - unit.ap
            this.hp_change = this.data.hp - unit.hp
            this.logged = true

            return false
        }

        if (this.time_passed >= INSTANT_EVENT_DURATION) {
            this.ap_change_left = 0
            this.hp_change_left = 0
            unit.hp = this.data.hp
            unit.ap = this.data.ap
            return true
        }

        this.time_passed += dt

        this.ap_change_left = this.ap_change * (this.time_passed / INSTANT_EVENT_DURATION)
        this.hp_change_left = this.hp_change * (this.time_passed / INSTANT_EVENT_DURATION)
        unit.hp = this.data.hp - this.hp_change_left
        unit.ap = this.data.ap - this.ap_change_left
        unit.position = this.data.position

        return false
    }

    generate_log_message():string {
        return 'ok'
    }
}

export class ClearBattleEvent extends BattleImageEvent {
    effect(dt: number) {
        console.log('clear battle')
        BattleImage.stop()
        return true
    }

    generate_log_message():string {
        return "battle is finished"
    }
}

function get_attack_direction(a: BattleUnitView, d: BattleUnitView) {
    let hor = 'left'
    if (a.position.x < d.position.x) {
        hor = 'right'
    }

    let ver = 'up'
    if (a.position.y < d.position.y) {
        ver = 'down'
    }

    return hor + '_' + ver
}

// write attack stages

export class AttackEvent extends BattleImageEvent {
    target: unit_id

    current_duration: number

    constructor(unit_id: unit_id, ap_change: number, hp_change: number, attack_data) {
        super(unit_id, ap_change, hp_change)
        this.target = attack_data.target
    }

    effect(dt: number) {
        let unit_view_attacker = units_views[this.unit]
        let unit_view_defender = units_views[this.target]

        let direction_vec = position_c.diff(unit_view_attacker.position, unit_view_defender.position)
        direction_vec = position_c.scalar_mult(1/position_c.norm(direction_vec), direction_vec) 

        unit_view_defender.animation_sequence.push({type: 'attacked', data: {direction: direction_vec, dodge: false}})
        unit_view_attacker.animation_sequence.push({type: 'attack', data: direction_vec})
        
        // unit_view_defender.animation_sequence.push('attack')
    }

    generate_log_message():string {
        let unit = units_data[this.unit_id]
        let target = units_data[this.target_id]
        let result = unit.name + ' attacks ' + target.name + ': '
        return result + ' HIT!'
    }
}

export class MissEvent {
    type: 'miss'
    unit_id: unit_id
    target_id: unit_id

    constructor(unit: unit_id, target: unit_id) {
        this.type = 'miss'
        this.unit_id = unit
        this.target_id = target 
    }

    effect() {
        let unit_view_attacker = units_views[this.unit_id]
        let unit_view_defender = units_views[this.target_id]

        let direction_vec = position_c.diff(unit_view_attacker.position, unit_view_defender.position)
        direction_vec = position_c.scalar_mult(1/position_c.norm(direction_vec), direction_vec) 

        unit_view_defender.animation_sequence.push({type: 'attacked', data: {direction: direction_vec, dodge: true}})
    }

    generate_log_message():string {
        let unit = units_data[this.unit_id]
        let target = units_data[this.target_id]
        let result = unit.name + ' attacks ' + target.name + ': '
        return result + ' MISS!';
    }
}

export class RetreatEvent {
    type: 'retreat'
    unit_id: unit_id
    
    constructor(unit_id: unit_id) {
        this.unit_id = unit_id
        this.type = 'retreat'
    }

    effect() {
        if (this.unit_id == player_id) {
            alert('You had retreated from the battle')
        } else {
            alert('Someone had retreated from the battle')
        }
    }

    generate_log_message():string {
        let unit = units_data[this.unit_id]
        return unit.name + ' retreats'
    }
}





export class NewTurnEvent {
    type: 'new_turn'
    unit:unit_id

    constructor(unit: unit_id) {
        this.type = 'new_turn'
        this.unit = unit
    }

    effect() {
        set_current_turn(this.unit)
    }

    generate_log_message():string {
        return 'new_turn'
    }
}