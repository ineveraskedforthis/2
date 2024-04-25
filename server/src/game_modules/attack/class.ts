import { SKILL } from "@content/content";
import { Damage } from "../Damage";
import { Status } from "../types";


export class AttackObj {
    flags: {
        crit: boolean,
        miss: boolean,
        blocked: boolean,
        close_distance: boolean,
        killing_strike: boolean
    }
    defender_status_change:Status;
    attacker_status_change:Status;
    related_skills:SKILL[];
    damage: Damage;
    chance_to_hit: number;
    new_pos: {x: number, y:number}|undefined;

    attack_skill:number
    defence_skill:number


    constructor(related_skills: SKILL[]) {
        this.flags = {
            crit: false,
            miss: false,
            blocked: false,
            close_distance: false,
            killing_strike: false
        }

        this.defender_status_change = {
            hp: 0,
            rage: 0,
            stress: 0,
            blood: 0,
            fatigue: 0
        }

        this.attacker_status_change = {
            hp: 0,
            rage: 0,
            stress: 0,
            blood: 0,
            fatigue: 0
        }

        this.new_pos = undefined

        this.damage = new Damage();
        this.related_skills = related_skills
        this.chance_to_hit = 0;
        this.attack_skill = 0
        this.defence_skill = 0
    }
}