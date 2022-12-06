import os

dire = os.curdir
for filename in os.listdir(dire):
    if filename.endswith('kra~') or filename.endswith('png~') or filename.endswith('jpg~'):
        os.remove(os.path.join(dire, filename))
        
