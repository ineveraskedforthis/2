import { trim } from "../calculations/basic_functions";
import { Item } from "../data/entities/item";
import { tagModel, tagRACE } from "../types";
import { Data } from "../data/data_objects";
import { ARMOUR, MATERIAL } from "@content/content";

const SKIN_RAT_DIFFICULTY = 10
const SKIN_HUMAN_DIFFICULTY = 40

export namespace Loot {
    export function base(dead:tagModel):{material: MATERIAL, amount: number}[] {
        switch(dead) {
            case 'elo': return [
                {material: MATERIAL.MEAT_ELODINO, amount: 3}
            ]
            case 'human': return [
                {material: MATERIAL.MEAT_HUMAN, amount: 10},
                {material: MATERIAL.BONE_HUMAN, amount: 2},
                {material: MATERIAL.SMALL_BONE_HUMAN, amount: 5},
                {material: MATERIAL.SKIN_HUMAN, amount: 5}
            ]
            case 'rat': {
                return  [
                    {material: MATERIAL.MEAT_RAT,     amount: 3},
                    {material: MATERIAL.SMALL_BONE_RAT, amount: 5},
                    {material: MATERIAL.BONE_RAT, amount: 1},
                    {material: MATERIAL.SKIN_RAT, amount: 2}
                ]
            }
            case 'magerat': {
                return  [
                    {material: MATERIAL.MEAT_RAT,     amount: 2},
                    {material: MATERIAL.SMALL_BONE_RAT, amount: 4},
                    {material: MATERIAL.SKIN_RAT, amount: 3},
                    {material: MATERIAL.ZAZ, amount: 1}
                ]
            }
            case 'bigrat': {
                return  [
                    {material: MATERIAL.MEAT_RAT, amount: 10},
                    {material: MATERIAL.SMALL_BONE_RAT, amount: 10},
                    {material: MATERIAL.BONE_RAT, amount: 2},
                    {material: MATERIAL.SKIN_RAT, amount: 6}
                ]
            }
            case 'graci': return [
                {material: MATERIAL.HAIR_GRACI, amount: 10},
                {material: MATERIAL.MEAT_GRACI, amount: 50},
                {material: MATERIAL.BONE_GRACI, amount: 10},
                {material: MATERIAL.SKIN_GRACI, amount: 50},
                {material: MATERIAL.SMALL_BONE_GRACI, amount: 100}
            ]
            case "test": return []
            case "berserkrat": return [
                {material: MATERIAL.MEAT_RAT, amount: 10},
                {material: MATERIAL.SMALL_BONE_RAT, amount: 10},
                {material: MATERIAL.BONE_RAT, amount: 2},
                {material: MATERIAL.SKIN_RAT, amount: 6}
            ]
            case "human_strong": return [
                {material: MATERIAL.MEAT_HUMAN, amount: 20},
                {material: MATERIAL.BONE_HUMAN, amount: 5},
                {material: MATERIAL.SMALL_BONE_HUMAN, amount: 10},
                {material: MATERIAL.SKIN_HUMAN, amount: 10}
            ]
            case "ball": return [
                {material: MATERIAL.MEAT_BALL, amount: 20},
                {material: MATERIAL.SKIN_BALL, amount: 20}
            ]
        }
        return []
    }

    export function items(dead:tagRACE):Item[] {
        let response = []
        console.log(dead)
        if (dead == 'rat') {
            let dice_drop = Math.random()
            console.log('drop dice ' + dice_drop)
            if (dice_drop > 0.5) {
                let item = Data.Items.create_armour(100, [], ARMOUR.HELMET_SKULL_RAT)
                let dice_quality = trim(Math.random() * Math.random(), 0.1, 1)
                item.durability = Math.floor(dice_quality * 100)
                response.push(item)
            }
        }

        return response
    }

    export function skin(race: tagRACE): MATERIAL|undefined {
        switch(race) {
            case "human":return MATERIAL.SKIN_HUMAN
            case "rat":return MATERIAL.SKIN_RAT
            case "graci":return MATERIAL.SKIN_GRACI
            case "elo":return undefined
            case "ball":return MATERIAL.SKIN_BALL
        }
    }
}