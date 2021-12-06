import os

def int_to_str(num, total_digits):
    assert(total_digits > 0)

    result = str(num)
    while len(result) < total_digits:
        result = '0' + result
    return result

def add_trailing_slash(folder_path):
    if folder_path[-1] != '/':
        return folder_path + '/'
    else:
        return folder_path

START_CLIP = 0
END_CLIP = 445

CWD = os.getcwd()
TS_PATH = os.path.join(CWD, "ts_clips/")
TS_PATH = add_trailing_slash(TS_PATH)

OUTPUT_TS = os.path.join(TS_PATH, "testing.ts")
OUTPUT_MP4 = os.path.join(CWD,"index2_24fps.mp4")

concat_str = "concat:"

for i in range(START_CLIP, END_CLIP + 1):
    count = int_to_str(i, 7)
    concat_str += TS_PATH + "clip" + count + ".ts"
    if i != END_CLIP:
        concat_str += "|"

print(f'ffmpeg -i \"{concat_str}\" -c copy {OUTPUT_TS}')
os.system(f'ffmpeg -i \"{concat_str}\" -c copy {OUTPUT_TS}')
os.system(f'ffmpeg -i {OUTPUT_TS} {OUTPUT_MP4}')
os.system(f'rm {OUTPUT_TS}')