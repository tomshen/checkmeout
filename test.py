from PIL import Image
im = Image.open('uploads/test02.jpg')
(width,height) = im.size
newwidth = width*2
newheight = height*2
print im.size
im = im.resize((newwidth,newheight), Image.BILINEAR)
print im.size
im.save('uploads/test02.jpg')

