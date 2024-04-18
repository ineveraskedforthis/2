import { ANIMATIONS } from "../../load_images.js";
import { BATTLE_ANIMATION_TICK } from "../constants.js";

let global_tick = 0

export class AnimatedImage {
    tag: string;
    current: number;
    action: "move"|"idle"|"attack"|"prepare"|"attacked"
    animation_tick: number

    constructor(image_name:string) {
        this.tag = image_name;
        this.current = 0
        this.action = 'idle'
        this.animation_tick = 0
    }

    get image_name() {
        return this.tag + '_' + this.action
    }

    update(dt: number) {
        this.animation_tick += dt
        while (this.animation_tick > BATTLE_ANIMATION_TICK) {
            this.animation_tick = this.animation_tick - BATTLE_ANIMATION_TICK
            if ((ANIMATIONS[this.image_name].length <= this.current + 1) && ((this.action == 'move') || (this.action == 'idle') || (this.action == 'attacked'))) {
                this.current = 0
            } else if (ANIMATIONS[this.image_name].length <= this.current + 1) {
                this.current = this.current
            } else {
                this.current += 1;
            }

            global_tick += 1
        }
    }

    set_action(tag:"move"|"idle"|"attack"|"prepare"|"attacked") {
        if (tag != this.action ){
            this.action = tag
            this.current = 0;
        }
    }

    get w() {
        return ANIMATIONS[this.image_name].data.width / ANIMATIONS[this.image_name].length
    }

    get h() {
        return ANIMATIONS[this.image_name].data.height
    }

    /**
     *
     * @param ctx Canvas context
     * @param data [x, y, w, h]
     * @param orientation rotation of the image
     */
    draw(ctx: CanvasRenderingContext2D, data: [number, number, number, number], orientation: 'right'|'left'): void {
        const w = this.w
        const h = this.h
        const x = w * this.current
        const y = 0
        const image = ANIMATIONS[this.image_name].data
        if (this.action == 'attacked') {
            if (global_tick % 5 == 0) {
                return
            }
        }

        let orientation_mult = 1
        if (orientation == 'left') {
            ctx.scale(-1, 1)
            orientation_mult = -1
        }

        ctx.drawImage(  image, x, y, w, h,
                        orientation_mult * Math.floor(data[0]), Math.floor(data[1]), orientation_mult * Math.floor(data[2]), Math.floor(data[3]))

        if (orientation == 'left') {
            ctx.scale(-1, 1)
        }
    }
}