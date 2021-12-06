import os
from flask import Flask, render_template
from scripts.generate_nodes_edges import cluster_generate_nodes_edges

app = Flask(__name__)

@app.route("/")
def index():
    # default page load
    default_selection = ['AST', 'BLK', 'FG3A', 'FG3M', 'FGM', 'PFD', 'PTS_2ND_CHANCE', 'PTS_FB', 'PTS_PAINT', 'REB', 'STL']

    stat_choices = ["FGM",
        "FGA",  # field goal attempts
        "FG3M",
        "FG3A",  # 3 point attempts
        "OREB",
        "DREB",
        "REB",
        "AST",
        "STL",
        "BLK",
        #"PF",  # fouls given
        "PFD",  # personal fouls drawn
        "PTS",
        "PTS_2ND_CHANCE",
        "PTS_FB",  # fast-break points
        "PTS_PAINT"]

    full_df_path = "./static/local/full_game_df.csv"
    #df, k_opt, inertia, edges, nodes = cluster_generate_nodes_edges(default_selection,
    #                                                               game_data_path=full_df_path, write_files=True)  # leave game_data_path default

    context = {
        'stat_selection': default_selection,
        'stat_choices': stat_choices,
        'k_opt': 7,
        'inertia': 4141.187960357087
    }

    return render_template("visualization.html", **context)




if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8001, debug=True)