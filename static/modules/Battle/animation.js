import { draw_image } from "./battle_image_helper";
import { BATTLE_ANIMATION_TICK } from "./constants";
export class AnimatedImage {
    constructor(image_name) {
        this.tag = image_name;
        this.current = 0;
        this.action = 'idle';
        this.animation_tick = 0;
    }
    get_image_name() {
        return this.tag + '_' + this.action + '_' + ("0000" + this.current).slice(-4);
    }
    update(dt, images) {
        this.animation_tick += dt;
        while (this.animation_tick > BATTLE_ANIMATION_TICK) {
            this.current += 1;
            this.animation_tick = this.animation_tick - BATTLE_ANIMATION_TICK;
            if (!(this.get_image_name() in images)) {
                this.current = 0;
            }
        }
    }
    set_action(tag) {
        if (tag != this.action) {
            this.action = tag;
            this.current = 0;
        }
    }
    get_w(images) {
        return images[this.get_image_name()].width;
    }
    get_h(images) {
        return images[this.get_image_name()].height;
    }
    // data is [x, y, w, h]
    draw(ctx, data, images) {
        draw_image(ctx, images[this.get_image_name()], Math.floor(data[0]), Math.floor(data[1]), Math.floor(data[2]), Math.floor(data[3]));
    }
}
