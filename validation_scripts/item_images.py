"""
    Small script which validates item images' layers and prints out missing layers
"""

from pathlib import Path
from PIL import Image
import pandas as pd



ITEMS = pd.read_csv("game_content/tables/armour.csv")

types = ITEMS["id"].values
slots = ITEMS["slot"].values

LAYERS = ['behind_all', 'behind_body', 'behind_right_arm', 'on_top']

RACE_MODEL = "human"

layer: str
item: str
slot: str

COUNTER = 0
COUNTER_MISSING = 0

for layer in LAYERS:
    for (item, slot) in zip(types, slots):
        access_string = f'static/img/character_image/{RACE_MODEL}/{slot}/{item}_{layer}.PNG'
        path = Path(access_string)
        if not path.is_file():
            image = Image.new("RGBA", (400, 700), color=(0,0,0,0))
            image.save(path)


SLOTS = pd.read_csv("game_content/tables/slots.csv")
slots = SLOTS["id"]

for layer in LAYERS:
    for slot in slots:
        if slot == "secondary":
            continue
        access_string = f'static/img/character_image/{RACE_MODEL}/{slot}/empty_{layer}.PNG'
        path = Path(access_string)
        if not path.is_file():
            image = Image.new("RGBA", (400, 700), color=(0,0,0,0))
            image.save(path)

ITEMS = pd.read_csv("game_content/tables/weapon.csv")

types = ITEMS["id"].values

for layer in LAYERS:
    for item in types:
        access_string = f'static/img/character_image/{RACE_MODEL}/weapon/{item}_{layer}.PNG'
        path = Path(access_string)
        if not path.is_file():
            image = Image.new("RGBA", (400, 700), color=(0,0,0,0))
            image.save(path)