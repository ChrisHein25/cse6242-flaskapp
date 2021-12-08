import os
from flask import Flask, render_template
from flask import request
from scripts.generate_nodes_edges import cluster_generate_nodes_edges
from csv import reader, writer
import pandas as pd
import json

app = Flask(__name__)

@app.route("/", methods=['GET', 'POST'])
def index():

    # common info
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
                    # "PF",  # fouls given
                    "PFD",  # personal fouls drawn
                    "PTS",
                    "PTS_2ND_CHANCE",
                    "PTS_FB",  # fast-break points
                    "PTS_PAINT"]
    full_game_df_orig = pd.read_pickle("./static/full_game_df_reduced.pkl")
    full_game_df_renamed = full_game_df_orig.rename(columns={"PLAYER_NAME": "name", "GAME_DATE": "date"}) # replace col names
    full_game_df_renamed["date"] = pd.to_datetime(full_game_df_renamed["date"], format='%m/%d/%y').dt.strftime('%Y-%m-%d')
    full_game_df_str = full_game_df_renamed.applymap(str)  # convert to str for JS read

    # handle request
    if request.method == 'POST':
        # reload page with user-selected input
        load_type = 'long'

        input = request.form
        selection = []
        for key in input.keys():
            selection.append(key)

        df, k_opt, inertia, edges, nodes = cluster_generate_nodes_edges(selection, full_df=full_game_df_orig, write_files=False)  # leave game_data_path default

    else:
        # default page load
        load_type = 'fast'
        selection = ['AST', 'BLK', 'FG3A', 'FG3M', 'FGM', 'PFD', 'PTS_2ND_CHANCE', 'PTS_FB', 'PTS_PAINT', 'REB', 'STL']
        k_opt = 7
        inertia = 4141.187960357087
        # rewrite nodes.csv and edges.csv back to stored default files in case they have been altered
        nodes = pd.read_csv('./static/data/nodes_default.csv')
        edges = pd.read_csv('./static/data/edges_default.csv')



    context = {
        'load_type': load_type,
        'stat_selection': selection,
        'stat_choices': stat_choices,
        'k_opt': k_opt,
        'inertia': inertia,
        'nodes': nodes.to_json(orient='records'),
        'edges': edges.to_json(orient='records'),
        'full_game_data': full_game_df_str.to_json(orient='records')
    }

    return render_template("visualization.html", **context)

@app.route("/test", methods=['GET', 'POST'])
def test():

    return render_template("test.html")

if __name__ == "__main__":
        app.run(host='0.0.0.0', port=8001, debug=True)
