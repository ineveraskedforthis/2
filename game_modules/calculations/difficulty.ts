export const DIFFICULTY_SPEAR = 5
export const BONUS_SPEAR = 0.1
export const MEAT_DIFFICULTY = 20
// export const DIFFICULTY_HUNTING = 10

export namespace Difficulty {
    export function success(skill: number, difficulty: number, bonus: number ): boolean {
        return (Math.random() < success_ratio(skill, difficulty, bonus))
    }

    export function success_ratio(skill: number, difficulty: number, bonus: number ): number {
        return Math.min(1, skill / difficulty + bonus)
    }

    export function failure_to_skill_up(skill: number, difficulty: number, bonus: number): boolean {
        const x = skill / 100
        const d = difficulty / 100 + 0.05
        return (Math.random() < Math.max(0, Math.min(1, x/d + bonus)))
    }

    export function success_to_skill_up(skill: number, difficulty: number, bonus: number): boolean {
        if (skill > difficulty) return false
        const x = skill / 100
        const d = difficulty / 100 + 0.05
        return (Math.random() < Math.max(0, Math.min(1, (d-x)/(d) + bonus)))
    }
}
