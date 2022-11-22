import { ANIMATIONS } from "../load_images.js";
import { BATTLE_ANIMATION_TICK } from "./constants.js";

export class AnimatedImage {
    tag: string;
    current: number;
    action: "move"|"idle"|"attack"|"prepare"
    animation_tick: number

    constructor(image_name:string) {
        this.tag = image_name;
        this.current = 0
        this.action = 'idle'
        this.animation_tick = 0
    }

    get_image_name() {
        return this.tag + '_' + this.action
    }
    
    update(dt: number) {
        this.animation_tick += dt
        while (this.animation_tick > BATTLE_ANIMATION_TICK) {
            this.animation_tick = this.animation_tick - BATTLE_ANIMATION_TICK
            if ((ANIMATIONS[this.get_image_name()].length <= this.current) && (this.action == 'move')) {
                this.current = 0
            } else {
                this.current += 1;
            }
        }        
    }

    set_action(tag:"move"|"idle"|"attack"|"prepare") {
        if (tag != this.action ){
            this.action = tag
            this.current = 0;
        }
    }

    get_w() {
        // console.log(this.get_image_name())
        // console.log(ANIMATIONS)
        return ANIMATIONS[this.get_image_name()].data.width / ANIMATIONS[this.get_image_name()].length
    }
    
    get_h() {
        return ANIMATIONS[this.get_image_name()].data.height
    }

    // data is [x, y, w, h]
    draw(ctx: CanvasRenderingContext2D, data: [number, number, number, number]) {
        const w = this.get_w()
        const h = this.get_h()
        const x = w * this.animation_tick
        const y = 0
        const image = ANIMATIONS[this.get_image_name()].data
        ctx.drawImage(  image, x, y, w, h, 
                        Math.floor(data[0]), Math.floor(data[1]), Math.floor(data[2]), Math.floor(data[3]))
    }
}