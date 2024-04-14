import { ANIMATIONS } from "../load_images.js";
import { BATTLE_ANIMATION_TICK } from "./constants.js";
let global_tick = 0;
export class AnimatedImage {
    constructor(image_name) {
        this.tag = image_name;
        this.current = 0;
        this.action = 'idle';
        this.animation_tick = 0;
    }
    get_image_name() {
        return this.tag + '_' + this.action;
    }
    update(dt) {
        this.animation_tick += dt;
        while (this.animation_tick > BATTLE_ANIMATION_TICK) {
            this.animation_tick = this.animation_tick - BATTLE_ANIMATION_TICK;
            if ((ANIMATIONS[this.get_image_name()].length <= this.current + 1) && ((this.action == 'move') || (this.action == 'idle') || (this.action == 'attacked'))) {
                this.current = 0;
            }
            else if (ANIMATIONS[this.get_image_name()].length <= this.current + 1) {
                this.current = this.current;
            }
            else {
                this.current += 1;
            }
            global_tick += 1;
        }
    }
    set_action(tag) {
        if (tag != this.action) {
            this.action = tag;
            this.current = 0;
        }
    }
    get_w() {
        // console.log(this.get_image_name())
        // console.log(ANIMATIONS)
        return ANIMATIONS[this.get_image_name()].data.width / ANIMATIONS[this.get_image_name()].length;
    }
    get_h() {
        return ANIMATIONS[this.get_image_name()].data.height;
    }
    // data is [x, y, w, h]
    draw(ctx, data, orientation) {
        const w = this.get_w();
        const h = this.get_h();
        const x = w * this.current;
        const y = 0;
        const image = ANIMATIONS[this.get_image_name()].data;
        if (this.action == 'attacked') {
            if (global_tick % 5 == 0) {
                return;
            }
        }
        // ctx.translate(canvas.width, 0);
        let orientation_mult = 1;
        if (orientation == 'left') {
            // ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
            orientation_mult = -1;
        }
        ctx.drawImage(image, x, y, w, h, orientation_mult * Math.floor(data[0]), Math.floor(data[1]), orientation_mult * Math.floor(data[2]), Math.floor(data[3]));
        if (orientation == 'left') {
            // ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        }
    }
}

