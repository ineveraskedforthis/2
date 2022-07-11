import { ITEM_MATERIAL } from "../static_data/item_tags"

export type material_index = number & { __brand: "index of the material"}

export class MaterialsManager{
    materials: ITEM_MATERIAL[]
    mat_dict: {[key: string]: number}
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

    get_material_with_index(n:material_index) {
        return this.materials[n]
    }

    get_material_with_tag(tag:string) {
        return this.materials[this.mat_dict[tag]]
    }

    validate_material(x: number) {
        if (x < this.new_material_id) {
            return true
        }
        return false
    }
}

