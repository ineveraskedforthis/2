import {AnimatedImage, battle_position, Canvas, CanvasContext, draw_image, get_mouse_pos_in_canvas, Image} from './battle_image_helper'


export function init_battle_control(battle_image:BattleImageNext, globals:any) {
    let socket = globals.socket;
    battle_image.canvas.onmousedown = event => {
        event.preventDefault();
        globals.bcp = true
    }

    battle_image.canvas.onmousemove = event => {
        let mouse_pos = get_mouse_pos_in_canvas(battle_image.canvas, event);
        battle_image.hover(mouse_pos);
    };

    battle_image.canvas.onmouseup = event => {
        let mouse_pos = get_mouse_pos_in_canvas(battle_image.canvas, event);
        if (globals.bcp) {
            battle_image.press(mouse_pos);
            globals.bcp = false;
        }
    }

    battle_image.socket = globals.socket;

    battle_image.add_action({name: 'move', tag: 'move'})
    battle_image.add_action({name: 'attack', tag: 'attack', cost: 1})
    battle_image.add_action({name: 'retreat', tag: 'flee', cost: 3})
    battle_image.add_action({name: 'end turn', tag: 'end_turn', cost: 0})
}






function two_points_to_line(a, b) {
    return new Line(a, minus(b, a))
}



calculate_canvas_pos(pos, image, images) {
    let centre = this.get_centre(pos);
    let w = image.get_w(images);
    let h = image.get_h(images);
    return [centre.x - w/10, centre.y - h/5 + 10, w/5, h/5]
}

function intersect(line, plane) {
    var n = mult(Math.sqrt(dot(plane.normal_vector, plane.normal_vector)), plane.normal_vector)
    var d = dot(plane.point, n)
    var a = dot(line.point, n)
    var b = dot(line.vector, n)
    var t = (d - a) / b
    return sum(mult(t, line.vector), line.point)
}

interface SocketBattleUnit {
    tag: string, 
    position: battle_position, 
    range: number, 
    hp: number, 
    name: string
}

type SocketBattleData = {[_ in number]: SocketBattleUnit};

class BattleUnit {
    id: battle_id
    name: string
    hp: number
    ap: number
    range: number
    position: battle_position
    killed: boolean

    constructor(id: battle_id, name: string, hp: number, ap: number, range: number, position: battle_position) {
        this.id = id
        this.name = name
        this.hp = hp
        this.ap = ap
        this.range = range
        this.position = position
        this.killed = false
        if (hp == 0) {
            this.killed = true
        }
    }
}

class MoveAnimation {
    constructor(start_time, start, end, movement_speed) {
        this.type = type
        this.start_time = start_time

        this.direction = minus(end, start)
        let distance = Math.sqrt(dot(this.direction, direction))
        let duration = distance / movement_speed 
        this.end_time = start_time + duration

        this.start = start 
        this.end = end

        this.tag = 'move'
    }

    get_data(time) {
        let ratio = (time - this.start_time) / this.duration
        return sum(this.start, mult(ratio, this.direction))
    }
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


type battle_id = number & { __brand: "battle"}

export class BattleImageNext {
    canvas: Canvas;
    canvas_background: Canvas;
    canvas_context: CanvasContext;
    container: any;
    socket: any;

    background: string
    background_flag:boolean

    w:number
    h:number
    movement_speed:number
    scale:number

    events_list: Event[]
    current_animations: MoveAnimation[]
    units_data: {[_ in battle_id]: BattleUnit}
    battle_ids: Set<battle_id>;
    images: {[_ in battle_id]: AnimatedImage}

    constructor(canvas:Canvas, canvas_background:Canvas) {
        this.canvas = canvas 
        this.canvas_background = canvas_background
        this.canvas_context = canvas.getContext('2d')

        this.container = document.getElementById('battle_tab')
        this.background = "colony";
        this.background_flag = false

        this.w = 700
        this.h = 450
        this.movement_speed = 0.3
        this.scale = 1

        this.events_list = []
        this.current_animations = []
        this.units_data = {}
        this.battle_ids = new Set()
        this.images = {}

        this.reset_data()
    }

    reset_data() {
        this.canvas_context.clearRect(0, 0, this.w, this.h);

        this.events_list = []
        this.current_animations = []
        this.units_data = {}
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
            this.add_fighter(Number(i) as battle_id, data[i].tag, data[i].position, data[i].range, data[i].name, data[i].hp)
        }
    }

    add_fighter(battle_id:battle_id, tag:string, pos:battle_position, range:number, name:string, hp:number) {
        console.log("add fighter")
        console.log(battle_id, tag, pos, range)

        let unit = new BattleUnit(battle_id, name, hp, 0, range, pos)
        this.battle_ids.add(battle_id)
        this.units_data[battle_id] = unit

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
        let event = new 
        for (let i in data) {
            let index = Number(i) as battle_id
            if ((data[i] == undefined) || (data[i].hp == 0)) {
                this.units_data[index].killed = true
            } else {
                this.units_data[index]
            }
        }
    }

    set_player(in_battle_id) {
        console.log('set_player_position')
        console.log(in_battle_id)
        this.player = in_battle_id
        console.log(this.player)
        this.update_player_actions_availability()
    }

    update_enemy(data) {
        for (let i in data) {
            this.units_data[i].name = data[i].name
            this.names[i] = data[i].name
            this.hps[i] = data[i].hp
            this.aps[i] = data[i].ap

            let div = this.container.querySelector('.enemy_list > .fighter_' + i)
            div.innerHTML = data[i].name + '<br> hp: ' + this.hps[i] + '<br> ap: ' + Math.floor(this.aps[i] * 10) / 10
        }

        this.update_player_actions_availability()        
    }

    update_player_actions_availability() {
        console.log('update_actions_availability')
        console.log(this.player)
        if (this.player == undefined) {
            return
        }

        if (this.aps == undefined) {
            return
        }

        if (this.aps[this.player] == undefined) {
            return
        }

        for (let i of this.actions) {
            let div = this.container.querySelector('.battle_control>.' + i.tag)
            if ((i.cost != undefined) && (this.aps[this.player].ap < i.cost)) {
                div.classList.add('disabled')
            } else {
                div.classList.remove('disabled')
            }
        } 
    }


    hover(pos) {
        let hovered = false;
        for (let unit_id in this.units_data) {
            let centre = this.get_centre(this.units_data[unit_id])
            let dx = centre.x - pos.x;
            let dy = centre.y - pos.y;
            dx = dx * dx;
            dy = dy * dy;
            if (dx + dy < 400) {
                hovered = true;
                this.set_hover(i)
            }
        } 
        if (!hovered) {
            this.remove_hover()
        }
    }

    set_hover(i) {
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
        this.events_list.push({action: 'stop_battle', time: -1})
    }



}


export class BattleImage {
    constructor(canvas, canvas_background) {
        this.canvas = canvas;
        this.canvas_background = canvas_background;

        this.container = document.getElementById('battle_tab')

        this.background = "colony";
        this.actions = []
        this.init()
        this.w = 700;
        this.h = 450;
        this.background_flag = false;
        this.movement_speed = 0.3;
        this.scale = 1;
        this.player = undefined

                
    }

    init() {
        let ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, this.w, this.h);
        this.positions = {}
        this.ids = {}
        this.images = {}
        this.battle_ids = new Set()
        this.killed = {}
        this.tick = 0;
        this.movement = 0;
        this.animation_tick = 0;

        this.units_data = {}
        this.units_animations = {}

        this.range = {}
        this.names = {}
        this.hps = {}
        this.aps = {}

        let div = this.container.querySelector('.enemy_list')
        div.innerHTML = ''

        this.hovered = undefined
        this.selected = undefined
        this.anchor = undefined
        // this.player = undefined

        this.action_queue = [];

        this.entity_animations = {}

        this.l = 0;
        this.r = 0;
        this.prev_positions = {}
        this.new_positions = {}
    }

    

    clear() {
        console.log('clear battle')
        this.update_action({action: 'stop_battle'})
    }

    

    

    update_action(action){
        if (action.action == 'pff') {
            return 'bad_action'
        }
        this.action_queue.push(action);
        this.r += 1
    }

    dist(a, b, positions) {
        return - positions[a] + positions[b]
    }
    
    draw(images, delta) {

        if (!this.background_flag){
            let ctx = this.canvas_background.getContext('2d');
            draw_image(ctx, images['battle_bg_' + this.background], 0, 0, this.w, this.h);
            this.background_flag = true;
        }  

        this.movement += delta;
        if ((this.movement > this.movement_speed)&(this.l >= this.r)) {
            this.movement = this.movement_speed;
        }

        while ((this.movement >= this.movement_speed) & (this.r > this.l)) {

            let who = undefined;
            for (let i in this.positions) {
                this.images[i].set_action('idle');
                this.prev_positions[i].x = this.new_positions[i].x;
                this.prev_positions[i].y = this.new_positions[i].y;
            }   
            let action = this.action_queue[this.l]
            if (action.action == 'move') {
                console.log('move', action.who)
                who = action.who;
                this.images[who].set_action(action.action)
                // this.new_positions[who].x = this.prev_positions[who].x + action.target.x;
                // this.new_positions[who].y = this.prev_positions[who].y + action.target.y;
                this.new_positions[who].x = action.target.x;
                this.new_positions[who].y = action.target.y;
            }
            else if (action.action == 'charge') {
                who = action.who;
                this.images[who].set_action('move')
                this.new_positions[who] = action.result.new_pos;
            }
            else if (action.action == 'attack') {
                who = action.attacker
                this.images[who].set_action(action.action)
            }
            else if (action.action == 'stop_battle') {
                console.log('stop_battle')
                return this.init()
            } else if (action.action == 'new_turn') {
                this.set_current_turn(action.target)
            } else if (action.who != undefined) {
                this.images[action.who].set_action('idle')
            }
            this.l +=1
            
            this.movement -= this.movement_speed;
        }

        this.animation_tick += delta;
        

        if (this.animation_tick > 1/15) {
            for (let i in this.positions) {
                this.update_pos(i)
            }

            let ctx = this.canvas.getContext('2d');
            ctx.clearRect(0, 0, this.w, this.h);

            let a = this.get_centre({x: -4, y: -3})
            let c = this.get_centre({x: 4, y: 10})
            ctx.strokeStyle = "rgba(0, 0, 0, 1)"
            ctx.strokeRect(a.x, a.y, c.x - a.x, c.y - a.y)

            // draw characters
            for (let i in this.positions) {
                if (!this.killed[i]) {
                    let pos = this.get_centre(this.positions[i])

                    //draw character attack radius circle and color it depending on it's status in ui
                    ctx.strokeStyle = "rgba(0, 0, 0, 1)"
                    ctx.beginPath();
                    ctx.arc(pos.x, pos.y, BATTLE_SCALE * this.range[i], 0, 2 * Math.PI);
                    if (this.selected == i) {
                        ctx.fillStyle = "rgba(10, 10, 200, 0.7)"
                    } else if (this.hovered == i) {
                        ctx.fillStyle = "rgba(0, 230, 0, 0.7)"
                    } else {
                        ctx.fillStyle = "rgba(200, 200, 0, 0.5)"
                    }
                    ctx.fill();

                    //draw a border of circle above
                    ctx.beginPath();
                    ctx.arc(pos.x, pos.y, BATTLE_SCALE * this.range[i], 0, 2 * Math.PI);
                    ctx.stroke();

                    //draw small circle at unit base
                    ctx.beginPath();
                    ctx.arc(pos.x, pos.y, BATTLE_SCALE/10, 0, 2 * Math.PI);
                    ctx.stroke();


                    //draw nameplates
                    ctx.font = '15px serif';
                    if (this.selected == i) {
                        ctx.fillStyle = "rgba(1, 1, 1, 1)"
                        ctx.strokeStyle = "rgba(0, 0, 0, 1)"
                    } else if (this.hovered == i) {
                        ctx.fillStyle = "rgba(1, 1, 1, 1)"
                        ctx.strokeStyle = "rgba(0, 0, 0, 1)"
                        
                    } else {
                        ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
                        ctx.strokeStyle = "rgba(0, 0, 0, 0.1)"
                    }
                    ctx.strokeRect(pos.x - 50, pos.y - 120, 100, 20)
                    ctx.strokeRect(pos.x - 50, pos.y - 100, 100, 20)
                    let string = this.names[i]
                    if (i == this.player) {
                        string = string + '(YOU)'
                    }
                    ctx.fillText(string + ' || ' + this.hps[i] + ' hp', pos.x - 45, pos.y - 105);
                    ctx.fillText('ap:  ' + Math.floor(this.aps[i] * 10) / 10, pos.x - 45, pos.y - 85);
                    
                }                
            }
            

            var draw_order = Array.from(this.battle_ids)
            draw_order.sort((a, b) => -this.positions[a].y + this.positions[b].y)
            for (let i of draw_order) {
                if (!this.killed[i]) {
                    var pos = this.calculate_canvas_pos(this.positions[i], this.images[i], images)
                    this.images[i].draw(ctx, pos[0], pos[1], pos[2], pos[3], images)
                    this.images[i].update(images)
                }                
            }
            if (this.anchor != undefined) {
                let ctx = this.canvas.getContext('2d');
                ctx.strokeStyle = 'rgba(255, 255, 0, 1)';
                ctx.fillStyle = "rgba(10, 10, 200, 0.9)";
                ctx.beginPath();
                ctx.arc(this.anchor.x, this.anchor.y, BATTLE_SCALE/10, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
                ctx.strokeStyle = 'rgba(0, 0, 0, 1)';

                if (this.player != undefined) {
                    ctx.beginPath()
                    let pos = this.positions[this.player];
                    let centre = this.get_centre(pos);
                    ctx.moveTo(centre.x, centre.y);
                    ctx.lineTo(this.anchor.x, this.anchor.y)
                    ctx.stroke()
                }
            }
            if ((this.selected != undefined) & (this.player != undefined)) {
                if (this.player != undefined) {
                    ctx.beginPath()
                    let pos1 = this.positions[this.player];
                    let centre1 = this.get_centre(pos1);
                    let pos2 = this.positions[this.selected];
                    let centre2 = this.get_centre(pos2);
                    ctx.moveTo(centre1.x, centre1.y);
                    ctx.lineTo(centre2.x, centre2.y)
                    ctx.stroke()
                }
            }
            this.animation_tick = this.animation_tick % (1/15);
        }
        
    }
    



    
    update_pos(battle_id) {
        if (!(battle_id in this.prev_positions)) {
            this.positions[battle_id] = this.new_position[battle_id]
        } else {
            let tmp = Math.min(this.movement, this.movement_speed) / this.movement_speed;
            this.positions[battle_id].x = this.prev_positions[battle_id].x + (this.new_positions[battle_id].x - this.prev_positions[battle_id].x) * tmp;
            this.positions[battle_id].y = this.prev_positions[battle_id].y + (this.new_positions[battle_id].y - this.prev_positions[battle_id].y) * tmp;
        }
    }





    set_selection(i) {
        if (this.selected != undefined) {
            let div = this.container.querySelector('.enemy_list > .fighter_' + this.selected)
            div.classList.remove('selected_unit')
        }
        this.selected = i;
        this.anchor = undefined
        let div = this.container.querySelector('.enemy_list > .fighter_' + i)
        div.classList.add('selected_unit')
    }

    remove_selection() {
        if (this.selected != undefined) {
            let div = this.container.querySelector('.enemy_list > .fighter_' + this.selected)
            div.classList.remove('selected_unit')
        }
        this.selected = undefined;
    }

    press(pos) {
        let selected = false;
        for (let i in this.positions) {
            let centre = this.get_centre(this.positions[i])
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

    get_anchor_coords() {
        if (this.anchor != undefined) {
            return this.reverse_centre(this.anchor);
        }
    }

    send_action(tag) {
        if (tag.startsWith('spell')) {
            if (this.selected != undefined) {
                this.socket.emit('battle-action', {action: tag, target: this.selected})
            }
        } else if (tag == 'move') {
            if (this.anchor != undefined) {
                this.socket.emit('battle-action', {action: 'move', target: this.get_anchor_coords()})
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

    add_action(action_type) {
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

    update_action_probability(tag, value) {
        console.log(tag, value)
        let label = document.getElementById(tag + '_chance_b')
        label.innerHTML = Math.floor(value * 100) + '%'
    }



    set_current_turn(i) {
        console.log('new turn ' + i)
        if (this.current_turn != undefined) {
            let div = this.container.querySelector('.enemy_list > .fighter_' + this.current_turn)
            div.classList.remove('current_turn')    
        }
        let div = this.container.querySelector('.enemy_list > .fighter_' + i)
        div.classList.add('current_turn')
        this.current_turn = i
    }

    // returns log message
    // returns null if no message needed
    battle_action(data) {
        if (data == null) {
            return ''
        }
        this.update_action(data)
        console.log('battle action data')
        console.log(data)
        if (data.action == 'end_turn') {
            return 'end_of_the_turn'
        }
        if ((data.action == 'not_enough_ap')) {
            console.log(data.who)
            console.log(this.player)
            if (data.who == this.player) {
                alert('Not enough action points')
                return 'Not enough action points'
            }            
            return 'ok'
        }
        if (data.action == 'pff') {
            return 'something wrong has happened'
        }
        if ((data.action == 'not_your_turn') ){
            if (data.who == this.player) {
                alert('Not your turn')
                return 'not_your_turn'
            }            
            return 'ok'
        }
        if (data.action == 'new_turn') {
            return null
        }
        if (data.action == 'move') {
            return data.actor_name + ' moved (' + data.target.x + ' ' + data.target.y + ')'
        }
        if (data.action == 'attack') {
            if (data.result.flags.crit) {
                return data.actor_name + ': critical_damage';
            }
            if (data.result.flags.evade || data.result.flags.miss) {
                return data.actor_name + ' missed';
            }
            return data.actor_name + ': deals ' + data.result.total_damage + ' damage';
        } else if (data.action.startsWith('kinetic_bolt')) {
            if (data.result.flags.crit) {
                return data.actor_name + ': critical_damage'
            }
            return data.actor_name + ': deals with magic bolt ' + data.result.total_damage + ' damage'
        } else if (data.action.startsWith('charge')) {
            return data.actor_name + '   CHAAAAAAAAAARGE   ' + data.result.total_damage + ' damage'
        } else if (data.action.startsWith('stop_battle')) {
            return 'battle has ended'
        } else if (data.action.startsWith('flee-failed')) {
            return this.names[data.who] + ' failed to retreat'
        } else if (data.action.startsWith('flee')) {
            if (data.action.who == this.player) {
                alert('You had retreated from the battle')
            } else {
                alert('Someone had retreated from the battle')
            }
            
            return this.names[data.who] + ' retreats'
        }

        return 'untreated case of battle action !!!!' + data.action
    }
}
