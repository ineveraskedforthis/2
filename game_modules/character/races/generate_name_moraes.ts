export function gen_from_moraes(moraes: string[], len:number) {
    let res = ''
    for (let i = 0; i < len; i++) {
        res += moraes[Math.floor(moraes.length * Math.random())];
    }
    return res
}