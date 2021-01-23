let BATTLE_SCALE = 50

class AnimatedImage {
    constructor(image_name) {
        this.tag = image_name;
        this.current = 0
        this.action = 'idle'
    }

    get_image_name() {
        return this.tag + '_' + this.action + '_' + ("0000" + this.current).slice(-4)
    }
    
    update() {
        this.current += 1;
        if (!(this.get_image_name() in images)) {
            this.current = 0
        }
    }

    set_action(tag) {
        if (tag != this.action ){
            this.action = tag
            this.current = 0;
        }
    }

    get_w() {
        return images[this.get_image_name()].width
    }
    
    get_h() {
        return images[this.get_image_name()].height
    }

    draw(ctx, x, y, w, h) {
        draw_image(ctx, images[this.get_image_name()], Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h))
    }
}

class Vector {
    constructor(x, y, z) {
        this.data = [x, y, z]
    }
}

class Line {
    constructor(p, v) {
        this.vector = v;
        this.point = p;
    }
}

class Plane {
    constructor(n, p) {
        this.normal_vector = n;
        this.point = p;
    }
}

function mult(s, v) {
    return new Vector(s * v.data[0], s * v.data[1], s * v.data[2])
}

function sum(a, b) {
    var c = new Vector(a.data[0] + b.data[0], a.data[1] + b.data[1], a.data[2] + b.data[2])
    return c
}

function minus(a, b) {
    var c = new Vector(a.data[0] - b.data[0], a.data[1] - b.data[1], a.data[2] - b.data[2])
    return c
}

function dot(a, b) {
    return a.data[0] * b.data[1] + a.data[1] * b.data[1] + a.data[2] * b.data[2];
}

function two_points_to_line(a, b) {
    return new Line(a, minus(b, a))
}

function intersect(line, plane) {
    var n = mult(Math.sqrt(dot(plane.normal_vector, plane.normal_vector)), plane.normal_vector)
    var d = dot(plane.point, n)
    var a = dot(line.point, n)
    var b = dot(line.vector, n)
    var t = (d - a) / b
    return sum(mult(t, line.vector), line.point)
}

class BattleImage {
    constructor(canvas, canvas_background) {
        this.canvas = canvas;
        this.canvas_background = canvas_background;
        this.background = "base_background_2";
        this.init()
        this.w = 800;
        this.h = 500;
        this.background_flag = false;
        this.movement_speed = 0.3;
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
        this.range = {}

        this.hovered = undefined
        this.selected = undefined
        this.anchor = undefined
        this.player = undefined

        this.action_queue = [];
        this.l = 0;
        this.r = 0;
        this.prev_positions = {}
        this.new_positions = {}
    }

    change_bg(bg) {
        this.background = bg;
        console.log('draw_background')
        let ctx = this.canvas_background.getContext('2d');
        // draw_image(ctx, images[this.background], 0, 0, this.w, this.h);
        this.background_flag = true;
    }

    clear() {
        console.log('clear battle')
        this.update_action({action: 'stop_battle'})
    }

    load(data) {
        console.log('load battle')
        this.init()
        for (var i in data) {
            this.add_fighter(i, data[i].tag, data[i].position, data[i].range, data[i].is_player)
        } 
    }

    update(data) {
        for (let i in data) {
            if ((data[i] == undefined) || (data[i].hp == 0)) {
                this.killed[i] = true
            }
        }
    }

    update_action(action){
        this.action_queue.push(action);
        this.r += 1
    }

    dist(a, b, positions) {
        return - positions[a] + positions[b]
    }
    
    draw(delta) {

        if (!this.background_flag){
            console.log('draw_background')
            let ctx = this.canvas_background.getContext('2d');
            // draw_image(ctx, images[this.background], 0, 0, this.w, this.h);
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
                console.log(this.prev_positions[who])
                this.new_positions[who].x = this.prev_positions[who].x + action.target.x;
                this.new_positions[who].y = this.prev_positions[who].y + action.target.y;
                console.log(this.new_positions[who])
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
            } else this.images[action.who].set_action('idle')
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

            for (let i in this.positions) {
                if (!this.killed[i]) {
                    let pos = this.get_centre(this.positions[i])
                    ctx.beginPath();
                    ctx.arc(pos.x, pos.y, BATTLE_SCALE, 0, 2 * Math.PI);
                    if (this.selected == i) {
                        ctx.fillStyle = "rgba(10, 10, 200, 0.7)"
                    } else if (this.hovered == i) {
                        ctx.fillStyle = "rgba(0, 230, 0, 0.7)"
                    } else {
                        ctx.fillStyle = "rgba(200, 200, 0, 0.5)"
                    }
                    ctx.fill();

                    ctx.beginPath();
                    ctx.arc(pos.x, pos.y, BATTLE_SCALE, 0, 2 * Math.PI);
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.arc(pos.x, pos.y, BATTLE_SCALE/10, 0, 2 * Math.PI);
                    ctx.stroke();
                }                
            }
            

            var draw_order = Array.from(this.battle_ids)
            draw_order.sort((a, b) => -this.positions[a].y + this.positions[b].y)
            for (let i of draw_order) {
                if (!this.killed[i]) {
                    var pos = this.calculate_canvas_pos(this.positions[i], this.images[i])
                    this.images[i].draw(ctx, pos[0], pos[1], pos[2], pos[3])
                    this.images[i].update()
                }                
            }
            if (this.anchor != undefined) {
                let ctx = this.canvas.getContext('2d');
                ctx.beginPath();
                ctx.arc(this.anchor.x, this.anchor.y, BATTLE_SCALE/10, 0, 2 * Math.PI);
                ctx.strokeStyle = 'rgba(255, 255, 0, 1)';
                ctx.fillStyle = "rgba(10, 10, 200, 0.9)";
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
    
    add_fighter(battle_id, tag, pos, range, is_player) {
        console.log("add fighter")
        console.log(battle_id, tag, pos)
        this.battle_ids.add(battle_id)
        this.new_positions[battle_id] = {x:pos.x, y:pos.y};
        this.prev_positions[battle_id] = {x:pos.x, y:pos.y};
        this.positions[battle_id] = {x:pos.x, y:pos.y};
        this.images[battle_id] = new AnimatedImage(tag)
        this.range[battle_id] = range;
        this.killed[battle_id] = false
        if (is_player) {
            this.player = battle_id
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
    
    // calculate_canvas_pos(x, image) {
    //     var base_vector = new Vector(0, 0, 1)
    //     var point_of_battle_line = new Vector(500, -250, 0)
    //     var height_vector = new Vector(0, image.get_h(), 0)
    //     var width_vector = new Vector(image.get_w(), 0, 0)
    //     var picture_plane = new Plane(base_vector, new Vector(0, 0, 0))
    //     var viewer_point = new Vector(0, 0, -30)
    //     var bottom_right_position = sum(sum(mult(x, base_vector), point_of_battle_line), mult(0.5, width_vector))
    //     var top_left_position = minus(sum(sum(mult(x, base_vector), point_of_battle_line), height_vector), mult(0.5, width_vector))
    //     var bottom_ray = two_points_to_line(bottom_right_position, viewer_point)
    //     var top_ray = two_points_to_line(top_left_position, viewer_point)
    //     var bottom_intersection = intersect(bottom_ray, picture_plane)
    //     var top_intersection = intersect(top_ray, picture_plane)
    //     var d = minus(bottom_intersection, top_intersection)
    //     var centre = sum(top_intersection, mult(0.5, d))
    //     centre = sum(centre, new Vector(this.w / 5, + this.h / 2, 0))
    //     var canvas_top_left = minus(centre, mult(0.5, d))
    //     return [canvas_top_left.data[0], this.h - canvas_top_left.data[1], d.data[0], -d.data[1]]
    // }

    get_centre(pos) {
        let centre = {x: pos.y, y: pos.x};
        centre.x = -centre.x * BATTLE_SCALE + 520;
        centre.y = centre.y * BATTLE_SCALE + 300;
        return centre
    }

    reverse_centre(pos) {
        let tmp = {x: pos.x, y: pos.y}
        tmp.x = (tmp.x - 520) / (-BATTLE_SCALE);
        tmp.y = (tmp.y - 300) / (BATTLE_SCALE)
        return {x: tmp.y, y: tmp.x}
    }

    calculate_canvas_pos(pos, image) {
        let centre = this.get_centre(pos);
        let w = image.get_w();
        let h = image.get_h();
        return [centre.x - w/10, centre.y - h/5 + 10, w/5, h/5]
    }

    hover(pos) {
        let hovered = false;
        for (let i in this.positions) {
            let centre = this.get_centre(this.positions[i])
            let dx = centre.x - pos.x;
            let dy = centre.y - pos.y;
            dx = dx * dx;
            dy = dy * dy;
            if (dx + dy < 400) {
                this.hovered = i;
                hovered = true;
            }
        } 
        if (!hovered) {
            this.hovered = undefined;
        }
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
                this.selected = i;
                this.anchor = undefined
                selected = true
            }
        } 
        if (!selected) {
            this.anchor = pos;
            this.selected = undefined;
        }
    }

    get_anchor_coords() {
        if (this.anchor != undefined) {
            return this.reverse_centre(this.anchor);
        }
    }

    get_action() {
        if (this.anchor != undefined) {
            return {action: 'move', target: this.get_anchor_coords()}
        }
        if (this.selected != undefined) {
            return {action: 'attack', target: this.selected};
        }
        return undefined;
    }

    get_action_spell() {
        let tag = document.getElementById('battle_select_skill').value;
        if ((tag == 'spell:charge') || (tag == 'spell:kinetic_bolt')) {
            if (this.selected != undefined) {
                return {action: tag, target: this.selected};
            }
        }
    }

    add_action(data) {
        let tag_option = new Option(data, data);
        document.getElementById('battle_select_skill').add(tag_option);
    }
}

export const BattleImage = BattleImage;