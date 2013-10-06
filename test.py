from PIL import Image,ImageEnhance
im = Image.open("uploads/test07.jpg")
enhancer = ImageEnhance.Color(im)
im = enhancer.enhance(0.0)
im.save("uploads/test08.jpg")

