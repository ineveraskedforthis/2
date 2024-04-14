"""
Simple utility tool to replace paths in typescript compiled code
"""

import os

ALIAS = "@content/"
REPLACE_WITH = "../game_content/src/"
FOLDER = "./server/build/server/server_source"
DOTS = "../"

for root, dirs, files in os.walk(FOLDER):
    for file_name in files:
        text = ""
        with open(root + "\\" + file_name, "r", encoding="utf-8") as file:
            text = file.read()

        dots = DOTS * (root.count("\\") + 2)
        text.replace(ALIAS, dots + REPLACE_WITH)

        with open(root + "\\" + file_name, "w", encoding="utf-8") as file:
            text = file.read()
