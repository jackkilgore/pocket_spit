import os
import argparse

parser = argparse.ArgumentParser()

parser.add_argument('-i', '--inputfolder', help='Input folder containing sequence of pngs with the naming convention 07d.png')
parser.add_argument('-o', '--output_ts', help='Output ts. Argument must end in .ts')

PATH = os.getcwd()
QUALITY = 17
FRAME_RATE = 24

def prepend_cwd(cwd, some_path):
    if some_path.startswith("/") or some_path.startswith("~/") :
        return some_path
    else:
        return os.path.join(cwd,some_path)

def add_trailing_slash(folder_path):
    if folder_path[-1] != '/':
        return folder_path + '/'
    else:
        return folder_path

args = parser.parse_args()

if args.inputfolder is None or args.output_ts is None:
    print("ERROR: Must specify an input and output.")
    print("EXIT without running...")
    exit(1)

args.inputfolder = prepend_cwd(PATH, args.inputfolder)
args.output_ts = prepend_cwd(PATH, args.output_ts)

pass_checks = True
if os.path.splitext(args.output_ts)[1] != '.ts':
    print("ERROR: Output must end with a ts extension.")
    pass_checks = False

if not os.path.isdir(args.inputfolder):
    print("ERROR: Not a valid input folder.")
    pass_checks = False

if not pass_checks:
    print("EXIT without running...")
    exit(1)

args.inputfolder = add_trailing_slash(args.inputfolder)
print(args)
# os.chdir({})
os.system(f'ffmpeg -r {FRAME_RATE} -f image2 -s 4096x2160 -i "{args.inputfolder}%07d.png" -vcodec libx264 -crf {QUALITY} -pix_fmt yuv420p {args.output_ts}')