import {AnimatedImage, AttackEvent, BattleEvent, BattleUnit, BattleUnitView, battle_id, battle_position, BATTLE_SCALE, Canvas, CanvasContext, canvas_position, ClearBattleEvent, draw_image, get_mouse_pos_in_canvas, Image, ImagesDict, MovementBattleEvent, NewTurnEvent, position_c, RetreatEvent, UpdateDataEvent} from './battle_image_helper.js'

import { SocketBattleData } from "../../shared/battle_data"

declare var alert: (data: string) => {}

function new_log_message(msg: string) {
    if (msg == null) {
        return
    }
    if (msg == 'ok') return;
    var log = document.getElementById('log');
    var new_line = document.createElement('p');
    var text = document.createTextNode(msg);
    new_line.append(text);
    log.appendChild(new_line);
    log.scrollTop = log.scrollHeight
}

interface battle_action {
    name: string,
    tag: string,
    cost?: number
}


function build_character_div(unit_data: BattleUnit, battle_data:BattleImageNext) {
    let div = document.createElement('div')
    div.innerHTML = 'hp: ' + unit_data.hp + '<br> ap: ' + unit_data.ap
    div.classList.add('fighter_' + unit_data.id)
    div.classList.add('enemy_status')
    div.onclick = () => battle_data.set_selection(unit_data.id)
    div.onmouseenter = () => battle_data.set_hover(unit_data.id)
    div.onmouseleave = battle_data.remove_hover
    return div
}


declare var document: any;
declare var images: {[_ in string]: Image};




export class BattleImageNext {
    canvas: Canvas;
    canvas_background: Canvas;
    canvas_context: CanvasContext;
    container: any;
    socket: any;

    background: string
    background_flag:boolean
    hovered: battle_id|undefined
    selected: battle_id|undefined
    current_turn: battle_id|undefined
    anchor: canvas_position|undefined

    w:number
    h:number
    scale:number

    actions: battle_action[]

    events_list: BattleEvent[]
    units_data: {[_ in battle_id]: BattleUnit}
    units_views: {[_ in battle_id]: BattleUnitView}
    battle_ids: Set<battle_id>;
    images: {[_ in battle_id]: AnimatedImage}

    player_id: undefined|battle_id

    constructor(canvas:Canvas, canvas_background:Canvas) {
        this.canvas = canvas 
        this.canvas_background = canvas_background
        this.canvas_context = canvas.getContext('2d')

        this.container = document.getElementById('battle_tab')
        this.background = "colony";
        this.background_flag = false
        this.hovered = undefined

        this.w = 700
        this.h = 450
        this.scale = 1

        this.events_list = []
        this.units_data = {}
        this.units_views = {}
        this.battle_ids = new Set()
        this.images = {}

        this.actions = []

        this.reset_data()
    }

    reset_data() {
        this.canvas_context.clearRect(0, 0, this.w, this.h);

        this.events_list = []
        this.units_data = {}
        this.units_views = {}

        this.selected = undefined
        this.hovered = undefined
        this.anchor = undefined
        this.current_turn = undefined

        this.battle_ids = new Set()

        {
            let div = this.container.querySelector('.enemy_list')
            div.innerHTML = ''
        }
    }

    load(data: SocketBattleData) {
        console.log('load battle')
        this.reset_data()
        for (var i in data) {
            this.add_fighter(Number(i) as battle_id, data[i].tag, data[i].position as battle_position, data[i].range, data[i].name, data[i].hp, data[i].ap)
        }
    }

    add_fighter(battle_id:battle_id, tag:string, pos:battle_position, range:number, name:string, hp:number, ap: number) {
        console.log("add fighter")
        console.log(battle_id, tag, pos, range)

        let unit = new BattleUnit(battle_id, name, hp, ap, range, pos, tag)
        let unit_view = new BattleUnitView(unit)

        this.battle_ids.add(battle_id)
        this.units_data[battle_id] = unit
        this.units_views[battle_id] = unit_view

        this.images[battle_id] = new AnimatedImage(tag)

        let div = build_character_div(unit, this)
        this.container.querySelector(".enemy_list").appendChild(div)
    }

    change_bg(bg:string) {
        this.background = bg;
        let ctx = this.canvas_background.getContext('2d');
        draw_image(ctx, images['battle_bg_' + this.background], 0, 0, this.w, this.h);
        this.background_flag = true;
    }

    update(data: SocketBattleData) {
        for (let i in data) {
            let index = Number(i) as battle_id

            console.log('update')
            console.log(data[i])

            let event = new UpdateDataEvent(index, data[i])
            this.events_list.push(event)
        }
    }

    set_player(battle_id: battle_id) {
        console.log('set_player_position')
        console.log(battle_id)
        this.player_id = battle_id
        this.update_player_actions_availability()
    }


    update_player_actions_availability() {
        if (this.player_id == undefined) {
            return
        }

        if (this.units_data[this.player_id] == undefined) {
            return
        }

        let player = this.units_data[this.player_id]

        for (let i of this.actions) {
            let div = this.container.querySelector('.battle_control>.' + i.tag)
            if ((i.cost != undefined) && (player.ap < i.cost)) {
                div.classList.add('disabled')
            } else {
                div.classList.remove('disabled')
            }
        } 
    }


    hover(pos: canvas_position) {
        let hovered = false;
        for (let unit_id of this.battle_ids) {
            let unit_view = this.units_views[unit_id]
            let centre = position_c.battle_to_canvas(unit_view.position, this.h, this.w)
            let dx = centre.x - pos.x;
            let dy = centre.y - pos.y;
            dx = dx * dx;
            dy = dy * dy;
            if (dx + dy < 400) {
                hovered = true;
                this.set_hover(Number(unit_id) as battle_id)
            }
        } 
        if (!hovered) {
            this.remove_hover()
        }
    }

    set_hover(i: battle_id) {
        if (this.hovered != undefined) {
            let div = this.container.querySelector('.enemy_list > .fighter_' + this.hovered)
            div.classList.remove('hovered_unit')
        }
        this.hovered = i;
        let div = this.container.querySelector('.enemy_list > .fighter_' + i)
        div.classList.add('hovered_unit')
    }

    remove_hover() {
        if (this.hovered != undefined) {
            let div = this.container.querySelector('.enemy_list > .fighter_' + this.hovered)
            div.classList.remove('hovered_unit')
        }
        this.hovered = undefined;
    }

    clear() {
        let event = new ClearBattleEvent
        this.events_list.push(event)
    }

    draw(images:ImagesDict, dt: number) {
        //handle_events
        for (let event of this.events_list) {
            event.effect(this)
            let log_entry = event.generate_log_message(this)
            new_log_message(log_entry)
        }
        this.events_list = []

        this.canvas_context.clearRect(0, 0, this.w, this.h);

        // draw background only once (no camera movement support yet)
        if (!this.background_flag){
            let ctx = this.canvas_background.getContext('2d');
            draw_image(ctx, images['battle_bg_' + this.background], 0, 0, this.w, this.h);
            this.background_flag = true;
        } 

        //sort views by y coordinate
        var draw_order = Array.from(this.battle_ids)
        draw_order.sort((a, b) => -this.units_views[a].position.y + this.units_views[b].position.y)

        //draw views
        for (let battle_id of draw_order) {
            let view = this.units_views[Number(battle_id) as battle_id]
            view.draw(dt, this, images)    
        }

        this.draw_anchor()
    }

    draw_anchor() {
        if (this.anchor != undefined) {
            let ctx = this.canvas.getContext('2d');
            ctx.strokeStyle = 'rgba(255, 255, 0, 1)';
            ctx.fillStyle = "rgba(10, 10, 200, 0.9)";
            ctx.beginPath();
            ctx.arc(this.anchor.x, this.anchor.y, BATTLE_SCALE/10, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            ctx.strokeStyle = 'rgba(0, 0, 0, 1)';

            if (this.player_id != undefined) {
                let player = this.units_views[this.player_id]
                let centre = position_c.battle_to_canvas(player.position, this.h, this.w);

                ctx.beginPath()
                ctx.moveTo(centre.x, centre.y);
                ctx.lineTo(this.anchor.x, this.anchor.y)
                ctx.stroke()
            }
        }

        if ((this.selected != undefined) && (this.player_id != undefined)) {
            let player = this.units_views[this.player_id]
            let target = this.units_views[this.selected]

            let centre1 = position_c.battle_to_canvas(player.position, this.h, this.w);
            let centre2 = position_c.battle_to_canvas(target.position, this.h, this.w);

            this.canvas_context.beginPath()
            this.canvas_context.moveTo(centre1.x, centre1.y);
            this.canvas_context.lineTo(centre2.x, centre2.y)
            this.canvas_context.stroke()
        }
    }

    set_selection(index: battle_id) {
        if (this.selected != undefined) {
            let div = this.container.querySelector('.enemy_list > .fighter_' + this.selected)
            div.classList.remove('selected_unit')
        }
        this.selected = index;
        this.anchor = undefined

        let div = this.container.querySelector('.enemy_list > .fighter_' + index)
        div.classList.add('selected_unit')
    }

    remove_selection() {
        if (this.selected != undefined) {
            let div = this.container.querySelector('.enemy_list > .fighter_' + this.selected)
            div.classList.remove('selected_unit')
        }
        this.selected = undefined;
    }

    press(pos: canvas_position) {
        let selected = false;
        for (let i of this.battle_ids) {
            let unit = this.units_views[i]
            let centre = position_c.battle_to_canvas(unit.position, this.h, this.w)
            let dx = centre.x - pos.x;
            let dy = centre.y - pos.y;
            dx = dx * dx;
            dy = dy * dy;
            if (dx + dy < 400) {
                this.set_selection(i)
                selected = true
            }
        } 
        if (!selected) {
            this.remove_selection()
            this.anchor = pos;
        }
    }

    send_action(tag:string) {
        if (tag.startsWith('spell')) {
            if (this.selected != undefined) {
                this.socket.emit('battle-action', {action: tag, target: this.selected})
            }
        } else if (tag == 'move') {
            if (this.anchor != undefined) {
                this.socket.emit('battle-action', {action: 'move', target: position_c.canvas_to_battle(this.anchor, this.h, this.w)})
            }
        } else if (tag == 'attack') {
            if (this.selected != undefined) {
                this.socket.emit('battle-action', {action: 'attack', target: this.selected})
            }
        } else if (tag == 'flee') {
            this.socket.emit('battle-action', {action: 'flee'})
        } else if (tag == 'end_turn') {
            this.socket.emit('battle-action', {action: 'end_turn'})
        }
    }

    add_action(action_type:battle_action) {
        this.actions.push(action_type)

        console.log(action_type)
        
        let action_div = document.createElement('div');
        action_div.classList.add('battle_action');
        action_div.classList.add(action_type.tag)
        
        {
            let label = document.createElement('div')
            label.innerHTML = action_type.name
            action_div.appendChild(label)
        }

        if (action_type.cost != undefined) {
            let label = document.createElement('div')
            label.innerHTML = 'ap: ' + action_type.cost;
            action_div.appendChild(label)
        }

        {
            let label = document.createElement('div')
            label.id = action_type.tag + '_chance_b'
            label.innerHTML = '???%'
            action_div.appendChild(label)
        }
        
        action_div.onclick = () => this.send_action(action_type.tag)

        // this.action_divs[action_type.name] = action_div

        let div = this.container.querySelector('.battle_control');
        div.appendChild(action_div)
    }

    update_action_probability(tag:string, value:number) {
        let label = document.getElementById(tag + '_chance_b')
        label.innerHTML = Math.floor(value * 100) + '%'
    }

    set_current_turn(index: battle_id) {
        console.log('new turn ' + index)
        if (this.current_turn != undefined) {
            let div = this.container.querySelector('.enemy_list > .fighter_' + this.current_turn)
            div.classList.remove('current_turn')    
        }
        let div = this.container.querySelector('.enemy_list > .fighter_' + index)
        div.classList.add('current_turn')
        this.current_turn = index
    }

    handle_socket_data(action: any){
        // handle immediate responces
        if ((action.action == 'not_enough_ap')) {
            if (action.who == this.player_id) {
                alert('Not enough action points')
                return 'Not enough action points'
            }            
            return 'ok'
        }
        if ((action.action == 'not_your_turn') ){
            if (action.who == this.player_id) {
                alert('Not your turn')
                return 'not_your_turn'
            }
            return 'ok'
        }
        if (action.action.startsWith('stop_battle')) {
            return 'battle has ended'
        }


        // handle real actions
        if (action.action == 'move') {
            let event = new MovementBattleEvent(action.who, action.target)
            console.log('move', action.who)
            this.events_list.push(event)        
        }
        else if (action.action == 'attack') {
            let event = new AttackEvent(action.attacker, action.target, action.result)
            this.events_list.push(event)
        }
        else if (action.action == 'stop_battle') {
            let event = new ClearBattleEvent()
            this.events_list.push(event)
        } else if (action.action == 'new_turn') {
            let event = new NewTurnEvent(action.target)
            this.events_list.push(event)
        } else if (action.action == 'flee'){
            this.events_list.push(new RetreatEvent(action.who))
        } else {
            console.log('unhandled input')
            console.log(action)
        }
    }
}
    

    // returns log message
    // returns null if no message needed
    // battle_action(data) {
    //     if (data == null) {
    //         return ''
    //     }
    //     this.update_action(data)
    //     console.log('battle action data')
    //     console.log(data)
    //     if (data.action == 'end_turn') {
    //         return 'end_of_the_turn'
    //     }
        
    //     if (data.action == 'pff') {
    //         return 'something wrong has happened'
    //     }
        
    //     else 
    //     } else if (data.action.startsWith('flee-failed')) {
    //         return this.names[data.who] + ' failed to retreat'
    //     }

    //     return 'untreated case of battle action !!!!' + data.action
    // }
