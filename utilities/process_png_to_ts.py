import os


START_CLIP = 0
END_CLIP = 445

CWD = os.getcwd()
PNG_PATH = os.path.join(CWD, "png_clips/")
TS_PATH = os.path.join(CWD, "ts_clips/")

def int_to_str(num, total_digits):
    assert(total_digits > 0)

    result = str(num)
    while len(result) < total_digits:
        result = '0' + result
    return result

count = START_CLIP

while count <= END_CLIP:
    count_str = int_to_str(count, 7)
    curr_png_path = os.path.join(PNG_PATH,'clip' + count_str)
    curr_ts_path = os.path.join(TS_PATH,'clip' + count_str + '.ts')
    
    os.system(f'python png_to_ts.py -i {curr_png_path} -o {curr_ts_path}')
    count += 1