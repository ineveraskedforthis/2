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
        // console.log(this.tag + '_' + this.current, x, y, w, h)
        // console.log(this.get_image_name())
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
        this.background = "base_background";
        this.init()
        this.w = 800;
        this.h = 500;
        this.background_flag = false;
        this.movement_speed = 1.4
    }

    init() {
        let ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, this.w, this.h);
        this.positions = {}
        this.ids = {}
        this.images = {}
        this.battle_ids = new Set()
        this.tick = 0;
        this.movement = 0;
        this.animation_tick = 0;
        
        this.action_queue = [];
        this.l = 0;
        this.r = 0;
        this.prev_positions = {}
        this.new_positions = {}
    }

    clear() {
        console.log('clear battle')
        this.update_action({action: 'stop_battle'})
    }

    load(data) {
        console.log('load battle')
        this.init()
        for (var i in data) {
            this.add_fighter(i, data[i].tag, data[i].position)
        } 
    }

    update(data) {

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
            draw_image(ctx, images[this.background], 0, 0, this.w, this.h);
            this.background_flag = true;
        }  

        if (this.action_queue.length == 0) {
            return
        }

        if (this.r > this.l) {
            this.movement += delta;
        }
        // console.log('!')
        while ((this.movement >= this.movement_speed) & (this.r > this.l)) {
            // console.log(this.r, this.l);
            let who = undefined;
            for (let i in this.positions) {
                this.images[i].set_action('idle');
                this.prev_positions[i] = this.new_positions[i]
            }
            // console.log(this.prev_positions);
            // console.log(this.new_positions);
            let action = this.action_queue[this.l]
            if (action.action == 'move') {
                who = action.who;
                this.images[who].set_action(action.action)
                if (action.target == 'right') {
                    // console.log('right')
                    this.new_positions[who] = this.prev_positions[who] + 1;
                }
                if (action.target == 'left') {
                    // console.log('left')
                    this.new_positions[who] = this.prev_positions[who] - 1;
                }
                // console.log(this.images[who].get_image_name());
            }
            else if (action.action == 'attack') {
                who = action.attacker
                this.images[who].set_action(action.action)
                // console.log(this.images[who].get_image_name());
            }
            else if (action.action == 'stop_battle') {
                console.log('stop_battle')
                return this.init()
            } else this.images[action.attacker].set_action('idle')

            this.l +=1
            this.movement -= this.movement_speed;
            // console.log()
        }

        this.animation_tick += delta;
        
        if (this.animation_tick > 1/15) {
            for (let i in this.positions) {
                this.update_pos(i)
            }

            // console.log('!')
            let ctx = this.canvas.getContext('2d');
            ctx.clearRect(0, 0, this.w, this.h);
            var draw_order = Array.from(this.battle_ids)
            draw_order.sort((a, b) => this.dist(a, b, this.positions))
            for (var i of draw_order) {
                var pos = this.calculate_canvas_pos(this.positions[i] * 10, this.images[i])
                // console.log(pos)
                this.images[i].draw(ctx, pos[0], pos[1], pos[2], pos[3])
                this.images[i].update()
            }
            this.animation_tick = this.animation_tick % (1/15);
        }
    }
    
    add_fighter(battle_id, tag, position) {
        // console.log(battle_id, tag, position)
        this.battle_ids.add(battle_id)
        this.new_positions[battle_id] = position;
        this.prev_positions[battle_id] = position;
        this.positions[battle_id] = position;
        this.images[battle_id] = new AnimatedImage(tag)
    }
    
    update_pos(battle_id) {
        if (!(battle_id in this.prev_positions)) {
            this.positions[battle_id] = this.new_position[battle_id]
        } else {
            let tmp = Math.min(this.movement, this.movement_speed) / this.movement_speed;

            this.positions[battle_id] = this.prev_positions[battle_id] + (this.new_positions[battle_id] - this.prev_positions[battle_id]) * tmp
        }
    }
    
    calculate_canvas_pos(x, image) {
        var base_vector = new Vector(0, 0, 1)
        var point_of_battle_line = new Vector(500, -250, 0)
        var height_vector = new Vector(0, image.get_h(), 0)
        var width_vector = new Vector(image.get_w(), 0, 0)
        var picture_plane = new Plane(base_vector, new Vector(0, 0, 0))
        var viewer_point = new Vector(0, 0, -30)
        var bottom_right_position = sum(sum(mult(x, base_vector), point_of_battle_line), mult(0.5, width_vector))
        var top_left_position = minus(sum(sum(mult(x, base_vector), point_of_battle_line), height_vector), mult(0.5, width_vector))
        var bottom_ray = two_points_to_line(bottom_right_position, viewer_point)
        var top_ray = two_points_to_line(top_left_position, viewer_point)
        var bottom_intersection = intersect(bottom_ray, picture_plane)
        var top_intersection = intersect(top_ray, picture_plane)
        // console.log(top_intersection.data)
        // console.log(bottom_intersection.data)
        var d = minus(bottom_intersection, top_intersection)
        var centre = sum(top_intersection, mult(0.5, d))
        centre = sum(centre, new Vector(this.w / 5, + this.h / 2, 0))
        var canvas_top_left = minus(centre, mult(0.5, d))
        // console.log(canvas_top_left.data[0], this.h - canvas_top_left.data[1], d.data[0], -d.data[1])
        return [canvas_top_left.data[0], this.h - canvas_top_left.data[1], d.data[0], -d.data[1]]
    }
}