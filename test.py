from PIL import Image
im = Image.open("uploads/test07.jpg")
im = im.convert('1')
im.save("uploads/test08.jpg")

