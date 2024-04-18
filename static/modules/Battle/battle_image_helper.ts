import { position } from "@custom_types/battle_data.js"

export type canvas_position = position & { __brand: "canvas"}

export type f3 = [number, number, number]

export namespace geom2 {

    export function diff<Type extends position>(a: Type, b: Type): Type {
        return {x: a.x - b.x, y:a.y - b.y} as Type
    }

    export function dist<Type extends position>(a: Type, b: Type):number {
        return norm(diff(b, a))
    }

    export function norm<Type extends position>(a: Type): number {
        return Math.sqrt(a.x * a.x + a.y * a.y)
    }

    export function sum<Type extends position>(a: Type, b: Type): Type {
        return {x: a.x + b.x, y:a.y + b.y} as Type
    }

    export function scalar_mult<Type extends position>(x: number, a: Type): Type {
        return {x: x * a.x, y: x * a.y} as Type
    }

    export function image_to_canvas(position:canvas_position, w:number, h:number):[number, number, number, number] {
        return [position.x - w/10, position.y - h/5 + 10, w/5, h/5]
    }
}

export namespace geom3 {
    export function dot3(a: f3, b: f3) {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
    }

    export function dist(a: f3, b: f3) {
        const c: f3 = [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
        return Math.sqrt(dot3(c, c))
    }
}


export interface animation_event {
    type: "move"|"attack"|"update"|'attacked'
    data: any
}

