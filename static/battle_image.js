
class AnimatedImage {
    constructor(image_name, count, w, h) {
        this.tag = image_name;
        this.count = count;
        this.w = w;
        this.h = h;
        this.current = 0
    }
    
    update() {
        this.current += 1;
        if (this.current >= this.count) {
            this.current = 0
        }
    }
    
    draw(ctx, x, y, w, h) {
        // console.log(this.tag + '_' + this.current, x, y, w, h)
        draw_image(ctx, images[this.tag + '_' + this.current], Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h))
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
    constructor(canvas, tmp_canvas) {
        this.canvas = canvas;
        this.tmp_canvas = tmp_canvas;
        this.background = "base_background";
        this.init()
        this.w = 800;
        this.h = 500;
    }

    init() {
        this.positions = {}
        this.ids = {}
        this.images = {}
        this.battle_ids = new Set()
    }

    clear() {
        console.log('clear battle')
        this.init()
    }

    load(data) {
        console.log('load battle')
        console.log(data)
        for (var i in data) {
            this.add_fighter(data[i].id, data[i].tag, data[i].position)
        } 
    }

    update(data) {
        console.log('update battle')
        for (var i in data) {
            this.update_pos(data[i].id, data[i].position)
        }
    }

    dist(a, b, positions) {
        return - positions[a] + positions[b]
    }
    
    draw() {
        var ctx = this.canvas.getContext('2d')
        ctx.clearRect(0, 0, this.w, this.h);
        draw_image(ctx, images[this.background], 0, 0, this.w, this.h)
        var draw_order = Array.from(this.battle_ids)
        draw_order.sort((a, b) => this.dist(a, b, this.positions))
        for (var i of draw_order) {
            var pos = this.calculate_canvas_pos(this.positions[i], this.images[i])
            // console.log(pos)
            this.images[i].draw(ctx, pos[0], pos[1], pos[2], pos[3])
        }
    }
    
    add_fighter(battle_id, tag, position) {
        console.log(battle_id, tag, position)
        this.battle_ids.add(battle_id)
        this.positions[battle_id] = position;
        this.images[battle_id] = new AnimatedImage(tag, 1, 200, 200)
    }
    
    update_pos(battle_id, position) {
        this.positions[battle_id] = position
    }
    
    calculate_canvas_pos(x, image) {
        var base_vector = new Vector(0, 0, 1)
        var point_of_battle_line = new Vector(500, -250, 0)
        var height_vector = new Vector(0, image.h, 0)
        var width_vector = new Vector(image.w, 0, 0)
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