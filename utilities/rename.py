from os import listdir, rename
from os.path import isfile, join

mypath = "/home/jckl/Downloads"
onlyfiles = [f for f in listdir(mypath) if isfile(join(mypath, f))]

for file in onlyfiles:
    if "movie (" in file:
        new_name = file
        a = file.rfind('(') + 1
        b = file.rfind(')')
        num = file[a:b]
        rename(file, "movie" + num + ".webm")