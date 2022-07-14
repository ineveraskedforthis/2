// var Character = require("./base_game_classes/character")
// import {CharacterGenericPart} from './base_game_classes/character_generic_part'

// class PredefinedMonster extends CharacterGenericPart {

//     async init(pool: PgPool, name = 'monster', cell_id: number) {        
//         if (name != null) {
//             this.name = name
//         }
        
//         this.specific_part_of_init(cell_id)

//         if (name != 'monster') {
//             this.name = name
//         }
        
//         this.id = await this.load_to_db(pool);
//         await this.load_to_db(pool);
//         return this.id;
//     }

//     specific_part_of_init(cell_id: number) {

//     }
// }

// export class Rat extends PredefinedMonster {

//     specific_part_of_init(cell_id: number) {
//         this.init_base_values('rat', cell_id);

//         this.name = 'rat'
//         this.status.hp = 30
//         this.stats.max.hp = 30
//         this.stats.magic_power = 0
//         this.stats.phys_power = 4
//         this.equip.data.right_hand = {tag: 'empty', affixes: 1, a0: {tag: 'sharp', tier: 1}}
//         this.stash.inc('meat', 1);
//         this.misc.model = 'rat'
//         this.misc.tag = 'rat'
//     }

//     rgo_check(character: CharacterGenericPart) {
//         let skinning = character.skills.skinning.practice
//         if (skinning > 10) {
//             let dice = Math.random()
//             if (dice < skinning / 50) {
//                 character.stash.inc('leather', 1)
//                 character.stash.inc('meat', 1)
//             } 
//         }
//         let dice = Math.random()
//         if (dice > skinning / 50) {
//             character.skills.skinning.practice += 1
//         }
//         character.stash.inc('meat', 2)
//         character.send_skills_update()
//         character.send_stash_update()
//     }

//     get_initiative() {
//         return 6
//     }

//     get_range() {
//         return 1
//     }

//     get_tag() {
//         return 'rat'
//     }
//     get_item_lvl() {
//         return 2;
//     }
// }

// export class Elodino extends PredefinedMonster  {
//     specific_part_of_init(cell_id: number) {
//         this.init_base_values('elodino', cell_id);
//         this.equip.data.right_hand = {tag: 'empty', affixes: 1, a0: {tag: 'sharp', tier: 2}}
//         this.stash.inc('meat', 2);
//         this.misc.model = 'elodino'
//     }

//     get_range() {
//         return 1
//     }

//     get_tag() {
//         return 'elodino'
//     }
//     get_item_lvl() {
//         return 5;
//     }
// }

// export class Graci extends PredefinedMonster  {
//     specific_part_of_init(cell_id: number) {
//         this.init_base_values('graci', cell_id);
//         this.status.hp = 200
//         this.stats.max.hp = 200
//         this.stats.phys_power = 20
//         this.equip.data.right_hand = {tag: 'empty', affixes: 1, a0: {tag: 'sharp', tier: 2}}
//         this.misc.model = 'graci'
//     }

//     get_tag() {
//         return 'graci'
//     }

//     get_item_lvl() {
//         return 10;
//     }

//     get_range() {
//         return 2
//     }

//     change_rage(x: number) {
//     }

//     change_blood(x: number) {
//     }
// }
