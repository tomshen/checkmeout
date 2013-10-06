from flask import Flask, render_template, jsonify, request
from flaskext.uploads import UploadSet, IMAGES, configure_uploads

from venmo import Venmo
from tesseract import parse_receipt

app = Flask(__name__)
app.config.update(
    DEBUG = True,
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

# Venmo API endpoint wrapper
@app.route('/venmo/me')
def venmo_me():
    return jsonify(Venmo(request.args['access_token']).user())
@app.route('/venmo/me/friends')
def venmo_me_friends():
    return jsonify({ 'friends': Venmo(request.args['access_token']).friends() })
@app.route('/venmo/users/<user_id>')
def venmo_user(user_id):
    return jsonify(Venmo(request.args['access_token']).user(user_id))
@app.route('/venmo/users/<user_id>/friends')
def venmo_user_friends(user_id):
    return jsonify({ 'friends': Venmo(request.args['access_token']).friends(user_id) })
@app.route('/venmo/payments', methods=['POST'])
def venmo_pay():
    return jsonify(Venmo(request.form['access_token']).pay(request.form['user_id'], request.form['note'], request.form['amount']))

if __name__ == '__main__':
    app.run()
