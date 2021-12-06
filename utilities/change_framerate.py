# Author - Jack Kilgore 
# Script for slowing down or speeding up an h264 mp4 

import os
import argparse
import math

def prepend_cwd(cwd, some_path):
    if some_path.startswith("/") or some_path.startswith("~/") :
        return some_path
    else:
        return os.path.join(cwd,some_path)

parser = argparse.ArgumentParser()

parser.add_argument('-i', '--input_mp4', help='Input mp4. Argument must end in .ts')
parser.add_argument('-o', '--output_mp4', help='Output mp4. Argument must end in .mp4')
parser.add_argument('-fr', '--framerate', type=int, help='Output framerate')

CWD = os.getcwd()
TMP_RAW = path.join(CWD, 'tmp.h264')

args = parser.parse_args()

if args.input_mp4 is None or args.output_mp4 is None or args.framerate is None:
    print("ERROR: Must specify an input, output, and  framerate.")
    print("EXIT without running...")
    exit(1)

args.input_mp4 = prepend_cwd(CWD, args.input_mp4)
args.output_mp4 = prepend_cwd(CWD, args.output_mp4)

pass_checks = True
if os.path.splitext(args.input_mp4)[1] != '.mp4' or os.path.exists(args.input_mp4):
    print("ERROR: Input must end with a mp4 extension.")
    pass_checks = False

if os.path.splitext(args.output_mp4)[1] != '.mp4':
    print("ERROR: Output must end with a mp4 extension.")
    pass_checks = False    

if not pass_checks:
    print("EXIT without running...")
    exit(1)


os.system(f'ffmpeg -i {args.input_mp4} -map 0:v -c:v copy -bsf:v h264_mp4toannexb {TMP_RAW}')

os.system(f'ffmpeg -fflags +genpts -r {int(args.framerate)} -i {TMP_RAW} -c:v copy {args.output_mp4})

os.system(f'rm  {TMP_RAW}')