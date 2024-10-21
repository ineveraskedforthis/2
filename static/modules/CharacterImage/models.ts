interface ModelProperties {
    w: number,
    h: number,
    corpse_images: string[]
}

export var models_description: Record<string, ModelProperties> = {
    'human': {
        w: 400, h: 700,
        corpse_images: ["corpse.PNG", "corpse_1.PNG", "corpse_2.PNG"]
    },
    'rat': {
        w: 560, h: 460,
        corpse_images: ["corpse.PNG"]
    },
    'graci': {
        w: 480, h: 1120,
        corpse_images: ["corpse.PNG"]
    },
    'elo': {
        w: 600, h: 600,
        corpse_images: ["corpse.PNG"]
    },
    'test': {
        w: 600, h: 600,
        corpse_images: ["corpse.PNG"]
    },
    'bigrat': {
        w: 600, h: 600,
        corpse_images: ["corpse.PNG", "corpse1.PNG"]
    },
    'magerat': {
        w: 600, h: 600,
        corpse_images: ["corpse.PNG"]
    },
    'berserkrat': {
        w: 600, h: 600,
        corpse_images: ["corpse.PNG", "corpse1.PNG"]
    },
    'human_strong': {
        w: 400, h: 700,
        corpse_images: ["corpse.PNG"]
    },
    'ball': {
        w: 450, h: 900,
        corpse_images: ["corpse.PNG"]
    },
}