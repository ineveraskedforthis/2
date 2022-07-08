

interface position {
    x: number
    y: number
}

export type battle_position = position & { __brand: "battle"}
export type canvas_position = position & { __brand: "battle"}

export function diff(a: battle_position, b:battle_position) {
    return {x: a.x - b.x, y:a.y - b.y}
}

export type Canvas = any & { __brand: "canvas"};
export type CanvasContext = any & { __brand: "canvas_context"};
export type ImagesDict = {[_: string] : Image}
export type Image = any & { __brand: "image"};


export const BATTLE_SCALE = 50

export namespace position_c {
    export function battle_to_canvas(pos: battle_position, canvas_h: number, canvas_w: number) {
        let centre = {x: pos.y, y: pos.x};
        centre.x = -centre.x * BATTLE_SCALE + 520;
        centre.y = centre.y * BATTLE_SCALE + canvas_h / 2;
        return raw_to_canvas(centre)
    }

    export function canvas_to_battle(pos: canvas_position, canvas_h: number, canvas_w: number) {
        let tmp = {x: pos.x, y: pos.y}
        tmp.x = (tmp.x - 520) / (-BATTLE_SCALE);
        tmp.y = (tmp.y - canvas_h / 2) / (BATTLE_SCALE)
        return raw_to_battle({x: tmp.y, y: tmp.x})
    }

    export function raw_to_battle(pos: position) {
        return pos as battle_position
    }
    export function raw_to_canvas(pos: position) {
        return pos as canvas_position
    }
}



export function draw_image(context:CanvasContext, image:Image, x:number, y:number, w:number, h:number) {
    context.drawImage(image, x, y, w, h)
}

export function get_mouse_pos_in_canvas(canvas:CanvasContext, event: any): canvas_position {
    var rect = canvas.getBoundingClientRect();
    let tmp = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
    return position_c.raw_to_canvas(tmp)
}

export class AnimatedImage {
    tag: string;
    current: number;
    action: string;

    constructor(image_name:string) {
        this.tag = image_name;
        this.current = 0
        this.action = 'idle'
    }

    get_image_name() {
        return this.tag + '_' + this.action + '_' + ("0000" + this.current).slice(-4)
    }
    
    update(images:string[]) {
        this.current += 1;
        if (!(this.get_image_name() in images)) {
            this.current = 0
        }
    }

    set_action(tag:string) {
        if (tag != this.action ){
            this.action = tag
            this.current = 0;
        }
    }

    get_w(images:ImagesDict) {
        return images[this.get_image_name()].width
    }
    
    get_h(images:ImagesDict) {
        return images[this.get_image_name()].height
    }

    draw(ctx: CanvasContext, x:number, y:number, w:number, h:number, images:ImagesDict) {
        draw_image(ctx, images[this.get_image_name()], Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h))
    }
}