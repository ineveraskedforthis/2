"""
https://stackoverflow.com/questions/27939282/python-rename-files-in-subdirectories
"""

import os

def main():
    """
    fix files extension
    """
    path = "./static/img/character_image/"
    count = 1

    for root, dirs, files in os.walk(path):
        for i in files:
            if i.endswith('.png'):
                result = i[:-4]
                print(result + ".PNG")
                # os.rename(os.path.join(root, i), os.path.join(root, "changed" + str(count) + ".txt"))
            count += 1


if __name__ == '__main__':
    main()