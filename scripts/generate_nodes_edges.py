# import other local scripts
import random

from scripts.classifier import Classifier
from scripts.graph import Graph
# import additional packages
from itertools import combinations
import pandas as pd
import math
import time

def cluster_generate_nodes_edges(grouping_factors, game_data_path='./local/full_game_df.csv'):

    # create Classifier and classify data set based on grouping factors
    cl = Classifier(game_data_path, grouping_factors, write_csv=False, prints=False)
    df, k_opt, inertia, full_df = cl.cluster(pass_full_df=True)

    # using outputted df, create nodes and edges Graph

    graph = Graph()  # instantiate Graph object

    path = './scripts/data/player_metadata.csv'
    df_meta = pd.read_csv(path)

    # iterate through all players, adding each's 3 nodes and edges
    for index, row in df.iterrows():
        player = row['PLAYER_NAME']
        name_1 = df[df['ID'] == row['id1']]['PLAYER_NAME'].values[0]
        group_1 = df[df['ID'] == row['id1']]['group'].values[0]
        min_1 = df[df['ID'] == row['id1']]['MIN'].values[0]
        name_2 = df[df['ID'] == row['id2']]['PLAYER_NAME'].values[0]
        group_2 = df[df['ID'] == row['id3']]['group'].values[0]
        min_2 = df[df['ID'] == row['id2']]['MIN'].values[0]
        name_3 = df[df['ID'] == row['id3']]['PLAYER_NAME'].values[0]
        group_3 = df[df['ID'] == row['id3']]['group'].values[0]
        min_3 = df[df['ID'] == row['id3']]['MIN'].values[0]

        # grab other player metadata from table
        player_id = row["ID"]
        player_name = row["PLAYER_NAME"]

        ids = [player_id, row['id1'], row['id2'], row['id3']]
        try:
            meta = []
            for i in range(4):
                meta.append(df_meta[df_meta['PLAYER_ID'] == int(ids[i])].reset_index().iloc[0])
        except:
            print('')

        position = []
        height = []
        weight = []
        country = []
        seasons_played = []
        team_city = []
        team_name = []
        start_year = []
        end_year = []
        draft_round = []
        all_star_appearances = []

        for i in range(4):
            if str(meta[i]['POSITION']) == 'nan':
                position.append('Unknown')
            else:
                position.append(meta[i]['POSITION'])
            height.append(meta[i]['HEIGHT'])
            weight.append(meta[i]['WEIGHT'])
            country.append(meta[i]['COUNTRY'])
            seasons_played.append(meta[i]['SEASON_EXP'])
            team_city.append(meta[i]['TEAM_CITY'])
            team_name.append(meta[i]['TEAM_NAME'])
            start_year.append(meta[i]['FROM_YEAR'])
            end_year.append(meta[i]['TO_YEAR'])
            draft_round.append(meta[i]['DRAFT_ROUND'])
            all_star_appearances.append(meta[i]['ALL_STAR_APPEARANCES'])

        # possible positions: ['Forward', 'Guard', 'Forward-Guard',
        # 'Center', 'Forward-Center', 'Center-Forward', 'Guard-Forward', 'Unknown']

        # add nodes
        graph.add_node(row['ID'], row['PLAYER_NAME'], row['group'], row['MIN'], position[0],
                       height[0], weight[0], country[0], seasons_played[0], team_city[0], team_name[0],
                       start_year[0], end_year[0], draft_round[0], all_star_appearances[0])  # add player himself
        graph.add_node(row['id1'], name_1, group_1, min_1, position[1],
                       height[1], weight[1], country[1], seasons_played[1], team_city[1], team_name[1],
                       start_year[1], end_year[1], draft_round[1], all_star_appearances[1])  # add player neighbor 1
        graph.add_node(row['id2'], name_2, group_2, min_2, position[2],
                       height[2], weight[2], country[2], seasons_played[2], team_city[2], team_name[2],
                       start_year[2], end_year[2], draft_round[2], all_star_appearances[2])  # add player neighbor 2
        graph.add_node(row['id3'], name_3, group_3, min_3, position[3],
                       height[3], weight[3], country[3], seasons_played[3], team_city[3], team_name[3],
                       start_year[3], end_year[3], draft_round[3], all_star_appearances[3])  # add player neighbor 3

        # add edges
        graph.add_edge(row['ID'], row['id1'])
        graph.add_edge(row['ID'], row['id2'])
        graph.add_edge(row['ID'], row['id3'])

    #graph.write_nodes_file("./scripts/data/nodes.csv")
    #graph.write_edges_file("./scripts/data/edges.csv")

    # return dataframe of nodes and edges
    nodes = pd.DataFrame(graph.nodes, columns=["id", "name", "group", "avg_min", "position", "height", "weight",
                                               "country", "seasons_played", "team_name", "team_city", "start_year",
                                               "end_year", "draft_round", "all_star_appearances"])

    edges = pd.DataFrame(graph.edges, columns=["source", "target"])

    return df, k_opt, inertia, edges, nodes






