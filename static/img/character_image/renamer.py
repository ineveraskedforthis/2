"""
https://stackoverflow.com/questions/27939282/python-rename-files-in-subdirectories
"""

import os

def main():
    """
    fix files extension
    """
    path = "./static/img/character_image/"
    for root, dirs, files in os.walk(path):
        for i in files:
            if i.endswith('.png'):
                result = i[:-4] + ".PNG"
                os.rename(os.path.join(root, i), os.path.join(root, result))

if __name__ == '__main__':
    main()