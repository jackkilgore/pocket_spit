import os

CWD = os.getcwd()
PATH = os.path.join(CWD,"png_clips/")

files = [f for f in os.listdir(PATH) if (f.lower().endswith('.tar'))]
# files.sort(key=os.path.getctime)

alph = lambda x : os.path.splitext(x)[0]

#Sort by creation time
files = sorted(files, key=alph)
count = 0
for file in files:
    if os.path.splitext(file)[1] != '.tar':
        continue
    stri = str(count)
    while len(stri) != 7:
        stri = '0' + stri
    # os.rename(os.path.join(PATH,file), os.path.join(PATH,"clip" + stri + '.tar'))
    count += 1


files = [f for f in os.listdir(PATH) if (f.lower().endswith('.tar'))]
files = sorted(files)

for file in files:
    if os.path.splitext(file)[1] != '.tar':
        continue

    out_folder = os.path.join(PATH,os.path.splitext(file)[0])

    if not os.path.isdir(out_folder):
        os.mkdir(out_folder)
        
    os.system('tar -xf ' + os.path.join(PATH,file) + ' -C ' + out_folder)
    os.system(f'rm {os.path.join(PATH,file)}')

