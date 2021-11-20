import os
from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def index():
    message = 'This is a python variable.'
    contacts = ['c1', 'c2', 'c3', 'c4', 'c5']
    x = 123456
    y = "This was passed through Python, to Jinja2, to HTML, then appended by an external JS script"

    context = {
        'message': message,
        'contacts': contacts,
        'x': x,
        'y': y
    }
    return render_template("index.html", **context)


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8000, debug=True)