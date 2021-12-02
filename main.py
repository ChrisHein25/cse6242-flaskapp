import os
from flask import Flask, render_template
from scripts.generate_nodes_edges import cluster_generate_nodes_edges

app = Flask(__name__)

@app.route("/")
def index():
    # default page load
    default_selection = ['AST', 'BLK', 'FG3A', 'FG3M', 'FGM', 'PFD', 'PTS_2ND_CHANCE', 'PTS_FB', 'PTS_PAINT', 'REB', 'STL']
    df, k_opt, inertia, edges, nodes = cluster_generate_nodes_edges(default_selection)  # leave game_data_path default

    message = 'This is a python variable.'
    contacts = ['c1', 'c2', 'c3', 'c4', 'c5']
    y = "This was passed through Python, to Jinja2, to HTML, then appended by an external JS script"
    x = 12345

    context = {
        'message': message,
        'contacts': contacts,
        'x': x,
        'y': y
    }
    return render_template("index.html", **context)




if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8001, debug=True)