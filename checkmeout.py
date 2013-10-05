from flask import Flask, render_template, jsonify, request
from flaskext.uploads import UploadSet, IMAGES, configure_uploads

from tesseract import parse_receipt
app = Flask(__name__)
app.config.update(
    DEBUG               = True,
    UPLOADED_RECEIPTS_DEST = 'uploads'
)

receipts = UploadSet('receipts', IMAGES)
configure_uploads(app, [receipts])
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/upload', methods=['GET', 'POST'])
def upload():
    if request.method == 'POST' and 'receipt' in request.files:
        filename = receipts.save(request.files['receipt'])
        return jsonify({ 'items': parse_receipt(filename) })
    return 'No receipt image found.', 400

if __name__ == '__main__':
    app.run()
