import os
from flask import Flask, render_template
from scripts.generate_nodes_edges import cluster_generate_nodes_edges

app = Flask(__name__)

@app.route("/")
def index():
    # default page load
    default_selection = ['AST', 'BLK', 'FG3A', 'FG3M', 'FGM', 'PFD', 'PTS_2ND_CHANCE', 'PTS_FB', 'PTS_PAINT', 'REB', 'STL']
    df, k_opt, inertia, edges, nodes = cluster_generate_nodes_edges(default_selection)  # leave game_data_path default

    context = {
        'k_opt': k_opt,
        'inertia': inertia,
        'nodes': nodes.to_html(classes='data', header="true"),
        'edges': edges.to_html(classes='data', header="true")
    }

    return render_template("index.html", **context)




if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8001, debug=True)