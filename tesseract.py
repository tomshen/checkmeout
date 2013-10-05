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

def should_be_period(index,line):
  return (index < len(line)-3 and index > 1 and 
  ord("0") <= ord(line[index-1]) and ord(line[index-1]) <= ord("9") and
  ord("0") <= ord(line[index+1]) and ord(line[index+1]) <= ord("9")
  ord("0") <= ord(line[index+2]) and ord(line[index+2]) <= ord("9"))


def parse_receipt(receipt_text):
  receipt_lines = receipt_text.split("\n")
  needed_lines = []
  for line in receipt_lines:
    hasint = False
    haschar = False
    hasperiod = False
    for index in xrange(len(line)):
      if ord(line[index]) == ord("."):
        hasperiod = True
      if should_be_period(index,line):
        line = line[0:index] + "." + line[index+1:]
        hasperiod = True
      elif ord("0") <= ord(line[index]) and ord(line[index]) <= ord("9"):
        hasint = True
      elif (ord("a") <= ord(line[index]) and ord(line[index]) <= ord("z") or
           ord("A") <= ord(line[index]) and ord(line[index]) <= ord("Z")):
        haschar = True
    if (haschar and hasperiod and hasint and not "TOTAL" in line.upper()):
      needed_lines.append(line)
  result = [0]*len(needed_lines)
  count = 0
  for line in needed_lines:
    tempitem = ""
    tempprice = 0
    for index in xrange(len(line)):
      if (ord("a") <= ord(line[index]) and ord(line[index]) <= ord("z") or
            ord("A") <= ord(line[index]) and ord(line[index]) <= ord("Z")):
        tempitem += line[index]
      elif ord(line[index]) == ord("."):
        right_digits_found = 0;
        while (right_digits_found + 1 + index < len(line) and 
            ord("0") <= ord(line[index + 1 +right_digits_found]) and
            ord(line[index + 1 + right_digits_found]) <= ord("9")):
            right_digits_found += 1
        for i in xrange(right_digits_found):
          tempprice += int(line[index+1+i])*10**(right_digits_found-i-1)
        price_search_left = 1
        while (price_search_left <= index and
            ord("0") <= ord(line[index-price_search_left]) and
            ord(line[index-price_search_left]) <= ord("9")):
          exp = price_search_left + right_digits_found - 1
          tempprice += int(line[index-price_search_left])*10**exp
          price_search_left += 1
    result[count] = dict()
    result[count]["name"] = tempitem
    result[count]["price"] = tempprice
    count += 1
  return result
