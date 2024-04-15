"""
Simple utility tool to replace paths in typescript compiled code
"""

import os
import shutil

print("REPLACING PATHS")

ALIAS = "@content/"
REPLACE_WITH = "./"
REPLACE_WITH_END = "../game_content/src/"
DOTS = "../"


FOLDER = "./server/build/server/server_source"

for root, dirs, files in os.walk(FOLDER):
    for file_name in files:
        text = ""
        with open(root + "\\" + file_name, "r", encoding="utf-8", newline='') as file:
            text = file.read()

        if text.count(ALIAS) == 0:
            continue

        dots = DOTS * (root.count("\\") + root.count("/") - 3)
        text = text.replace(ALIAS, dots + REPLACE_WITH + REPLACE_WITH_END)

        with open(root + "\\" + file_name, "w", encoding="utf-8", newline='') as file:
            print(text, file = file)


shutil.copy("./game_content/src/content.js", "./static/content.js")

FOLDER = "./static/"
REPLACE_WITH = "./"

for root, dirs, files in os.walk(FOLDER):
    ##print(root)
    for file_name in files:
        if file_name.endswith(".js"):
            text = ""
            with open(root + "\\" + file_name, "r", encoding="utf-8", newline='') as file:
                text = file.read()

            if text.count(ALIAS) == 0:
                continue

            dots = ""
            if (root.count("\\") + root.count("/")) > 2:
                dots = DOTS * (root.count("\\") + root.count("/") - 1)

            text = text.replace(ALIAS, dots + REPLACE_WITH)

            with open(root + "\\" + file_name, "w", encoding="utf-8", newline='') as file:
                print(text, file = file)