from subprocess import call
from sys import stderr
from os import path

def image_to_text(image_name, image_dir='uploads'):
    image_path = path.join(image_dir, image_name)
    text_path = path.join('/tmp', image_name)
    call(['tesseract', image_path, text_path], stdout=stderr)
    with open(text_path + '.txt') as t:
        print('Converted %s' % image_path)
        return t.read()
