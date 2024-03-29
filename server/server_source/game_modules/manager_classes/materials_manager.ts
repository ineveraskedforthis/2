import { ITEM_MATERIAL } from "../items/ITEM_MATERIAL"


export type material_index = number & { __brand: "index of the material"}

export class MaterialsManager{
    materials: ITEM_MATERIAL[]
    mat_dict: {[key: string]: material_index}
    new_material_id: material_index
    list_of_indices: material_index[]

    constructor() {
        this.materials = []
        this.mat_dict = {}
        this.new_material_id = 0 as material_index
        this.list_of_indices = []
    }

    add_material(material: ITEM_MATERIAL):material_index {
        this.materials.push(material)
        this.mat_dict[material.string_tag] = this.new_material_id
        this.list_of_indices.push(this.new_material_id)
        this.new_material_id = this.new_material_id + 1 as material_index
        return this.new_material_id - 1 as material_index
    }

    create_material(density: number, hardness:number, string_tag: string): material_index {
        let mat = new ITEM_MATERIAL(density, hardness, string_tag)
        let ind = this.add_material(mat)
        return ind
    }

    get_materials_json() {
        return this.mat_dict
    }

    get_materials_list():material_index[] {
        return this.list_of_indices
    }

    index_to_material(n:material_index) {
        return this.materials[n]
    }

    tag_to_material(tag:string) {
        return this.materials[this.mat_dict[tag]]
    }
    
    tag_to_index(tag:string) {
        return this.mat_dict[tag]
    }

    validate_material(x: number) {
        if (x < this.new_material_id) {
            return true
        }
        return false
    }
}

export const materials = new MaterialsManager()

export const RAT_SKIN = materials.create_material(          0.2,    4, 'rat_skin')
export const RAT_BONE = materials.create_material(          0.3,    6, 'rat_bone')
export const ELODINO_FLESH = materials.create_material(     0.1,    1, 'elodino_flesh')
export const GRACI_HAIR = materials.create_material(        0.5,   20, 'graci_hair')
export const WOOD = materials.create_material(              0.5,    6, 'wood')
export const STEEL = materials.create_material(             3,     20, 'steel')
export const FOOD = materials.create_material(              0.2,    1, 'food')
export const ZAZ = materials.create_material(               1,     10, 'zaz')
export const MEAT = materials.create_material(              0.3,    1, 'meat')
export const WATER = materials.create_material(             0.2,    1, 'water')
export const ARROW_BONE = materials.create_material(        0.5,    3, 'arrow_bone')
export const FISH = materials.create_material(              0.3,    1, 'fish')
export const COTTON = materials.create_material(            0.1,    0.5, 'cotton')
export const TEXTILE = materials.create_material(           0.1,    1.5, 'textile')
