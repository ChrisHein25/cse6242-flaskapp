function runJS (inputs) {

    load_type = inputs["load_type"];
    stat_selection = inputs["stat_selection"]
    nodes = inputs["nodes"];
    edges = inputs["edges"];
    full_game_data = inputs["full_game_data"];

    console.log('variables loaded')
    //console.log('nodes', nodes)
    //console.log('edges', edges)

    // define dimensions and margins for the graph
    var w = 1300;
    var h = 1500;
    var pad = 50;
    var day = 10;
    var radius = 3;

    ////////////////////// begin: helper functions ///////////////////////
    function getArrayDates(startDate, endDate)
    {
        // reset endDate as +1 to ensure last day of new array matches game data
        endDate.setDate(endDate.getDate() + 1)

        var dateArray = new Array();
        var currentDate = startDate;
        while (currentDate <= endDate)
        {
            var year = currentDate.getFullYear()
            var month = currentDate.getMonth() + 1
            var day = currentDate.getDate()

            if (month.toString().length < 2) month = "0" + month;
            if (day.toString().length < 2) day = "0" + day;

            var pushDate = year + "-" + month + "-" + day
            dateArray.push(pushDate);
            currentDate.setDate(currentDate.getDate() + 1)
        }

        return dateArray
    }

    function mapData(dateArray, gameDate, gameInfo, day)
    {
        var mapDateOut = []
        for (let i = 0; i < dateArray.length; i++)
        {
            var flag = 0
            for (let k = 0; k < gameDate.length; k++)
            {
                if (dateArray[i] == gameDate[k])
                {
                    mapDateOut.push([dateArray[i], gameInfo[k]])
                    flag = 1
                    break
                }
            }
            if (flag) continue
            mapDateOut.push([dateArray[i], null])
        }
        return mapDateOut
    }

    function movingAverage(mappedDataIn, day)
    {
        var day_moving_average = []
        var previousAverage = 0
        for (let i = 0; i < mappedDataIn.length - day + 1; i++)
        {
            moving_average_array = mappedDataIn.slice(i, i + day)
            var average = 0
            var sum = 0
            var count = 0
            for (let k = 0; k < moving_average_array.length; k++)
            {
                if (moving_average_array[k][1] != null)
                {
                    sum += moving_average_array[k][1]
                    count++
                }
            }
            average = sum/count
            if (isNaN(average))
            {
                day_moving_average.push([mappedDataIn[i + day - 1][0], previousAverage])
            }
            else
            {
                day_moving_average.push([mappedDataIn[i + day - 1][0], average])
                previousAverage = average
            }
        }

        return day_moving_average
    }

    function countInjuries(injury_type, injury_dictionary)
    {
        for (let i = 0; i < injury_type.length; i++)
        {
            if (injury_type[i] in injury_dictionary)
            {
                injury_dictionary[injury_type[i]]++
            }
            else
            {
                injury_dictionary[injury_type[i]] = 1
            }
        }

        return injury_dictionary
    }
    ////////////////////// end: helper functions /////////////////////////

    // import injury data
    d3.dsv(",", "/static/data/injuries.csv", function(d)
    { return {
        date : d["Date"],
        team : d["Team"],
        name : d["Relinquished"],
        notes: d["Notes"],
        body_injury : d["Body Injury"],
    }
    }).then(function(injuryList)
    {
        //console.log('nodes in first loop:', nodes)
        //console.log('Injury Data: ', injuryList[0]);
        // import game data
        d3.dsv(",", "/static/data/injury_cluster.csv", function(d)
        { return {
              null: 0
//            name : d["PLAYER_NAME"],
//            date : d["GAME_DATE"],
//            FGA : d["FGA"],
//            FGM : d["FGM"],
//            FG3A : d["FG3A"],
//            FG3M : d["FG3M"],
//            OREB : d["OREB"],
//            DREB : d["DREB"],
//            REB : d["REB"],
//            AST : d["AST"],
//            STL : d["STL"],
//            BLK : d["BLK"],
//            PFD : d["PFD"],
//            PTS : d["PTS"],
//            PTS_2ND_CHANCE : d["PTS_2ND_CHANCE"],
//            PTS_FB : d["PTS_FB"],
//            PTS_PAINT : d["PTS_PAINT"]
        }
        }).then(function(gameData)
        {

            gameData = full_game_data; // replace dummy dsv name with passed jinja variable

            //('Orig Game Data: ', gameData[0]);
            //console.log('Pickle Game Data: ', full_game_data[0]);
            //console.log('nodes in 2nd loop:', nodes)
            // import node data
            d3.dsv(",", "/static/data/player_groups.csv", function(d) // filler csv to keep structure - Chris
            { return {
                null: 0
            }
            }).then(function(nodesList)
            {
                ////// FD //////
                Promise.all([
//                    d3.csv("/static/data/nodes.csv", function (d) {
//                        return {
//                            // format data attributes
//                            id: parseInt(d["id"]),
//                            name: String(d["name"]).trim(),
//                            group: parseInt(d["group"]),
//                            avg_min: parseFloat(d["avg_min"])
//                        }
//
//                    }),
//                    d3.csv("/static/data/edges.csv", function (d) {
//                        return {
//                            // format data attributes
//                            source: parseInt(d["source"]),
//                            target: parseInt(d["target"])
//                        }
//                    }),
                    nodes,
                    edges

                ]).then(function(data) {
                  nodes = data[0]
                  nodesList = data[0]
                  edges = data[1]
                  //console.log('nodesList', nodesList)

                var links = edges;
                var nodes_1=nodes
                var nodes = {};

                var number_grouping=[]



                    nodes_1.forEach(function(node) {
                      number_grouping.push(node.group)
                  });
                number_grouping=number_grouping.sort();
                var number_groups=d3.set(number_grouping).values();

                var splits=(width-100)/number_groups.length
                var distances=[]
                number_groups.forEach(function(elem){
                   distances.push(number_groups.indexOf(elem)*200+500)
                })



                  links.forEach(function(link) {
                      link.source = nodes[link.source] || (nodes[link.source] = {id: link.source});
                      link.target = nodes[link.target] || (nodes[link.target] = {id: link.target});
                  });

                    links.forEach(function(link) {
                    var result = nodes_1.filter(function(node) {
                        return link.source.id === node.id;
                    });
                    link.source.player_name = (result[0] !== undefined) ? result[0].name : null;
                    link.source.group = (result[0] !== undefined) ? result[0].group : null;
                    link.source.avg_time = (result[0] !== undefined) ? result[0].avg_min : null;
                  });

                  links.forEach(function(link) {
                    var result1 = nodes_1.filter(function(node) {
                        return link.target.id === node.id;
                    });
                    link.target.player_name = (result1[0] !== undefined) ? result1[0].name : null;
                    link.target.group = (result1[0] !== undefined) ? result1[0].group : null;
                    link.target.avg_time = (result1[0] !== undefined) ? result1[0].avg_min : null;
                  });


                  links.forEach(function(link) {
                    var result1 = nodes_1.filter(function(node) {
                        return link.target.id === node.id;
                    });
                    link.target.player_name = (result1[0] !== undefined) ? result1[0].name : null;
                    link.target.group = (result1[0] !== undefined) ? result1[0].group : null;
                    link.target.avg_time = (result1[0] !== undefined) ? result1[0].avg_min : null;
                  });

                  links.forEach(function(link) {
                    if(link.source.group === link.target.group)
                                  {
                                    link.attraction= 100
                                  }
                                  else{
                                    link.attraction=-400
                                  }
                  });

                  var width = 1850,
                      height =500;
                    // var width = 1000,
                    //   height = 500;
                /*
                var x = d3.scaleOrdinal()
                  .domain([0, 1, 2, 3, 4])
                  .range([400, 600, 800 ,1000,1200])
                */
                var x = d3.scaleOrdinal()
                  .domain(number_groups)
                  .range(distances)


                var y = d3.scaleOrdinal()
                  .domain(number_groups)
                  .range(distances)
                //  .range([50, 200, 340, 440 ,540])

                  var minimum_Degree = d3.min(
                  d3.values(nodes), function(d)
                  {
                    return d.degree;
                  }
                  );

                  var maximum_Degree =
                  d3.max(
                  d3.values(nodes), function(d)
                  {
                  return d.degree;
                  }
                  );

                  var minimum_avg_time =
                  d3.min(
                  d3.values(nodes_1), function(d)
                  {
                    return d.avg_min;
                  }
                  );

                  var maximum_avg_time =
                  d3.max(
                  d3.values(nodes_1), function(d)
                  {
                  return d.avg_min;
                  }
                  );
                /*
                  var nodescale_avg = d3.scaleSqrt()
                  .domain( [minimum_avg_time, maximum_avg_time] )
                  .range( [10, 20] );
                */

                  var nodescale_avg = d3.scaleLog()
                  .domain( [minimum_avg_time, maximum_avg_time] )
                  .range([10, 30]);


                  var force = d3.forceSimulation()
                      .nodes(d3.values(nodes))
                      .force("link", d3.forceLink(links).distance(10))
                      .force('center', d3.forceCenter(width /2, height / 2))
                  //    .force("center", d3.forceCenter().x(width).y(height / 2))
                    //  .force("x", d3.forceX())
                    //  .force("y", d3.forceY())
                      .force("x", d3.forceX().strength(0.5*2).x( function(d){ return x(d.group) } ))
                  //    .force("x", d3.forceX().x( function(d){ return x(d.group) } ))
                 //     .force("y", d3.forceX().strength(0.5).y( function(d){ return y(d.group) } ))
                      .force("y", d3.forceY().strength(0.8*1.5).y( height/2 ))
                      .force("charge", d3.forceManyBody().strength(-150))
                  //    .force("collide", d3.forceCollide().strength(.1).radius(32).iterations(1))
                      .force("collide", d3.forceCollide().strength(0.1).radius((d) => nodescale_avg(d.avg_time) ).iterations(1))
                      .alphaTarget(1)
                      .on("tick", tick);

                 //     console.log(links)

                  var svg = d3.select("body").append("svg")
                    .attr("width", width + 200)
                    .attr("height", height)
                    .attr("transform","translate(-590,-75) scale(0.52)");

                  // add the links
                  var path = svg.append("g")
                      .selectAll("path")
                      .data(links)
                      .enter()
                      .append("path")
                      .attr("class", function(d) { return "link " + d.type; })
                      .style('opacity', 0);


                  // define the nodes
                  var node = svg
                      .selectAll(".node")
                      .data(force.nodes())
                      .enter().append("g")
                      .attr("class", "node")
                      .on("dblclick",freenode)
                      .call(d3.drag()
                          .on("start", dragstarted)
                          .on("drag", dragged)
                          .on("end", dragended));

                  d3.selectAll('.node')
                    .each(function(d) {
                      d.degree = 0;
                    });
                    links.forEach(function(link){
                    link.source.degree =link.source.degree+1;
                    link.target.degree =link.target.degree+1;
                    });




                   var colourscale_avg = d3.scaleSqrt()
                  .domain([minimum_avg_time, maximum_avg_time])
                  .range(["#deebf7","#9ecae1","#3182bd"])


                  var nodescale = d3.scaleSqrt()
                  .domain( [minimum_Degree, maximum_Degree] )
                  .range( [10, 20] );


                  var data_to_be_sent_1=[]
                  var color = d3.scaleOrdinal(d3.schemeCategory20);
                  function freenode(d) {
                    d.fx = null;
                    d.fy = null;
                    d3.select(this)
                      .select("circle")
                      var filtered = path.filter(function(l){
                  return (d.id === l.source.id || d.id === l.target.id);
                })
                      var filtered1 = path.filter(function(l){
                  return (d.id !== l.source.id && d.id !== l.target.id);
                })
                    filtered.style("stroke-width", 2)
                    filtered1.style("display","block");

                  nodes_1.forEach(function(node) {
                    //if(node.group === d.group && node.avg_min > 30 && data_to_be_sent_1.length <= 19)
                    if(node.group === d.group && data_to_be_sent_1.length <= 0)
                    {
                    data_to_be_sent_1.push(node.group)
                    }
                  });


                node.select("text").style("visibility", "hidden")
                //console.log(data_to_be_sent_1)



                //////////// update graph ////////////
                var list_of_players = []
                cluster_value = data_to_be_sent_1[0]
                for (let i = 0; i < node_data_nest[cluster_value].values.length; i++)
                {
                    list_of_players.push(node_data_nest[cluster_value].values[i].name)
                }

                var selectedPlayers = list_of_players.slice(0, 5)

                // nest game data by player
                var game_data_nest = d3.nest()
                                       .key(function(d) {return d.name;}).sortKeys(d3.ascending)
                                       .entries(gameData);

                // nest injury data by player
                var injury_nest = d3.nest()
                                    .key(function(d) {return d.name;}).sortKeys(d3.ascending)
                                    .entries(injuryList);

                var list_of_injuries = update_injuries(list_of_players)
                update_body(list_of_injuries)

                // set the first name to be the start of the group
                var setParameter = parameters[0]

                var selectedParameterOption = parameterSelect.property("value")
                update_graph(selectedPlayers, selectedParameterOption)

                // when the user selects a new paramter, update the chart
                d3.select("#parameterSelectButton").on("change", function(d)
                {
                    var selectedParameterOption = parameterSelect.property("value")
                    update_graph(selectedPlayers, selectedParameterOption)
                })
                //////////// update graph ////////////

                data_to_be_sent_1 = []

                };

                var color = d3.scaleOrdinal(d3.schemeCategory10)
                              .domain(number_groups)
                  // add the nodes
                  node.append("circle")
                      .attr("id", function(d){
                          return (d.id);})
                      .attr("r", function(d) {
                        return nodescale_avg(d.avg_time)/3;
                      })
                      .style("fill", function(d){
                      return color(d.group);
                      })

                    node.on("mouseenter", (evt, d) => {
                      path.attr("display", "none")
                          .filter(l => l.id === d.id || l.id === d.id)
                          .attr("display", "block")
                          .style("opacity",1)

                    })

                node.on('click', function(d) {
                var filtered = path.filter(function(l){
                  return (d.id === l.source.id || d.id === l.target.id);
                })
                var filtered1 = path.filter(function(l){

                  return (d.id !== l.source.id && d.id !== l.target.id);
                })
                filtered.style("stroke-width", 5);
                filtered1.style("display","none");

                // data_to_be_sent_1=[]


                });



                  node.on('mouseover', function(d) {
                      //console.log(d);
                var filtered = path.filter(function(l){
                  return (d === l.source || d === l.target);
                })
                var selectedData = [];
                filtered.each(function(f){
                  selectedData.push(f.source);
                  selectedData.push(f.target);
                });


                  });
                  node.on('mouseleave', function(d) {
                var filtered = path.filter(function(l){
                  return (d === l.source || d === l.target)
                })
                filtered.style("stroke-width", 2)

                });
                  node.on('mouseleave',function(d){
                      path.style("opacity",0)
                  })


                  var labels=node.append("text")
                      .text(function(d){
                      return d.player_name;
                      })
                      .attr("x",6)
                      .attr("y",-11)
                      .style("font-weight","bold")
                 //     .style("font-size", "1.5em")
                     .style("font-size", "1em")
                      .style("visibility", "hidden")
                //      .style("text-shadow", "0 5px 0 #fff, 1px 0 0 #000, 0 -1px 0 #fff, -1px 0 0 #fff")
                     // console.log(force.nodes())

                  node.on("mouseover", function(d)
                 {
                    d3.select(this).select("text").style("visibility", "visible")
                 })



                  // add the lines
                  function tick() {
                      path.attr("d", function(d) {
                          var dx = d.target.x - d.source.x,
                              dy = d.target.y - d.source.y,
                              dr = 0
                          return "M" +
                              d.source.x + "," +
                              d.source.y + "A" +
                              dr + "," + dr + " 0 0,1 " +
                              d.target.x + "," +
                              d.target.y;
                      });

                      node.attr("transform", function(d) {
                          return "translate(" + d.x + "," + d.y + ")";
                      });
                  };

                  function dragstarted(d) {
                      if (!d3.event.active) force.alphaTarget(0.3).restart();
                      d.fx = d.x;
                      d.fy = d.y;
                  };


                  function dragged(d) {
                      d.fx = d3.event.x;
                      d.fy = d3.event.y;
                  };

                  function dragended(d) {
                      if (!d3.event.active) force.alphaTarget(0.5);
                      if (d.fixed == true) {
                          d.fx = d.x;
                          d.fy = d.y;

                      }

                  };
                ////// FD //////

                // create parameter drop down
                parameters = stat_selection;

                // create drop down button
                var parameterSelect = d3.select("#parameterSelectButton")
                                        .append('select');

                //console.log('parameterSelect', parameterSelect)

                // add the options to the button
                parameterSelect.selectAll('myOptions')
                               .data(parameters)
                               .enter()
                               .append('option')
                               .text(function (d) { return d; }) 		  // text showed in the menu
                               .attr("value", function (d) { return d; }) // corresponding value returned by the button

                // create SVG
                var svg = d3.select("body")
                            .append("svg")
                            .attr("width", w)
                            .attr("height", h/2)
                            .attr("x", 0)
                            .attr("y", 1000)
                            .attr("id", "svg")
                            .attr("transform","translate(-125,-250) scale(0.8)");

                // create SVG groups
                var lines = svg.append("g")
                               .attr("id", "lines");

                var circles = svg.append("g")
                                 .attr("id", "circles");

                var line_chart_title = svg.append("g")
                                          .attr("id", "line_chart_title");

                var credit = svg.append("g")
                                .attr("id", "credit");

                var legend = svg.append("g")
                                .attr("id", "legend");

                // add the title
                // line_chart_title.append("text")
                //    				.attr("id", "title")
                //    				.attr("x", w/2 - 2*pad)
                //    				.attr("y", h/16)
                //    				.text("Injuries");

                // RANDOMLY SELECTED CLUSTER NUMBER
                var cluster_value = 0
                var return_players = 5

                // nest node data by group
                var node_data_nest = d3.nest()
                                       .key(function(d) {return d.group;}).sortKeys(d3.ascending)
                                       .sortValues(function(a, b) {return parseFloat(b.avg_min) - parseFloat(a.avg_min)})
                                       .entries(nodesList);

                //console.log('node_data_nest', node_data_nest)

                // return all players in that cluster
                var list_of_players = []
                for (let i = 0; i < node_data_nest[cluster_value].values.length; i++)
                {
                    list_of_players.push(node_data_nest[cluster_value].values[i].name)
                }

                var selectedPlayers = list_of_players.slice(0, 5)


                // nest game data by player
                var game_data_nest = d3.nest()
                                       .key(function(d) {return d.name;}).sortKeys(d3.ascending)
                                       .entries(gameData);

                // nest injury data by player
                var injury_nest = d3.nest()
                                    .key(function(d) {return d.name;}).sortKeys(d3.ascending)
                                    .entries(injuryList);

                var list_of_injuries = update_injuries(list_of_players)
                update_body(list_of_injuries)

                // set the first name to be the start of the group
                var setParameter = parameters[0]

                var selectedParameterOption = parameterSelect.property("value")
                update_graph(selectedPlayers, selectedParameterOption)

                // when the user selects a new paramter, update the chart
                d3.select("#parameterSelectButton").on("change", function(d)
                {
                    var selectedParameterOption = parameterSelect.property("value")
                    update_graph(selectedPlayers, selectedParameterOption)
                })



                // hover over
                function handleMouseOver(d, i)
                {
                    d3.select(this).attr("r", 10);

                    var injury_type_text = d3.select(this).attr("id");
                    var injury_type_svg = svg.append("g")
                                             .attr("id", "injury_type_svg")

                    injury_type_svg.append("text")
                                   .attr("dx", pad)
                                   .attr("dy", h/2 - pad/4)
                                   .text(injury_type_text)
                                   .attr("font-size", "12.5px")
                                   .attr("font-family", "arial")
                                   .attr("fill", "black")
                                   .attr("id", "injury_type_text");

                    injury_type_text = injury_type_text.replace(/ /g, "")
                    var selection = d3.select("#circle_" + injury_type_text)
                    selection.attr("fill-opacity",1);
                    var r_chng = selection.attr("r") * 2.5;
                    selection.attr("r",r_chng)

                }

                // hover away
                function handleMouseOut(d, i)
                {
                    d3.select(this).attr("r", 3);
                    d3.select("#injury_type_svg").remove()
                    d3.select("#injury_type_text").remove()
                    var injury_type_text = d3.select(this).attr("id");
                    injury_type_text = injury_type_text.replace(/ /g, "")
                    var selection = d3.select("#circle_" + injury_type_text)
                    selection.attr("fill-opacity",0.4);
                    var r_chng = selection.attr("r") / 2.5;
                    selection.attr("r",r_chng)
                }

                // update graph based on selected player or parameter
                function update_graph(selectPlayer, selectParameter)
                {
                    d3.select("#x-axis-lines").remove();
                    d3.select("#svg_summary").remove();


                    // remove existing circles and lines
                    for (let i = 0; i < selectPlayer.length; i++)
                    {
                        d3.select("#circles").remove();
                        d3.select("#lines").remove();
                        d3.select("#y-axis-lines-" + i).remove();
                    }

                    colors = ["red", "orange", "green", "blue", "purple"]

                    // find min max limits for x and y axes
                    var min_x = new Date('2010-01-01')
                    var max_x = new Date('2020-01-01')
                    var min_y = 0
                    var max_y = 0

                    // axes
                    var xScale = d3.scaleTime()
                                    .domain([min_x, max_x])
                                    .range([pad, w - 2*pad]);

                    var x = d3.axisBottom()
                                    .scale(xScale)
                                    .ticks(10);

                    // add the x axis
                    var xAxis = svg.append("g")
                                   .attr("id", "x-axis-lines")
                                   .attr("class", "axis")
                                   .attr("transform", "translate(0," + (h/2 - pad - 150) + ")")
                                   .call(x)

                    // add the text label for the x axis
                    xAxis.append("text")
                         .attr("id", "x-axis label")
                         .style("fill", "black")
                         .attr("x", w/2 - pad/2)
                         .attr("y", pad*4/5)
                         .text("Date");

                    for (let i = 0; i < selectPlayer.length; i++)
                    {
                        var setName = selectPlayer[i]
                        var setParameter = selectParameter

                        var game_date = []
                        var game_info = []
                        var injury_date = []
                        var injury_type = []

                        // populate the arrays
                        for (let i = 0; i < game_data_nest.length; i++)
                        {
                            if (game_data_nest[i].key == setName)
                            {
                                for (let k = 0; k < game_data_nest[i].values.length; k++)
                                {
                                    game_date.push(game_data_nest[i].values[k].date)
                                    game_info.push(parseFloat(game_data_nest[i].values[k][setParameter]))
                                }
                            }
                        }

                        for (let i = 0; i < injury_nest.length; i++)
                        {
                            if (injury_nest[i].key == setName)
                            {
                                for (let k = 0; k < injury_nest[i].values.length; k++)
                                {
                                    injury_date.push(injury_nest[i].values[k].date)
                                    injury_type.push(injury_nest[i].values[k].body_injury)
                                }
                            }
                        }

                        // create new circle and line groups
                        var lines = svg.append("g")
                                       .attr("id", "lines")

                        var circles = svg.append("g")
                                         .attr("id", "circles")

                        var players_game_data_rearranged = game_date.map((d, i) =>
                                                           {return {x: d, y: game_info[i]}})

                        // calculate moving average
                        var startDate = new Date(game_date[0])
                        var endDate = new Date(game_date[game_date.length - 1])
                        var date_array = getArrayDates(startDate, endDate)
                        var mappedDataOut = mapData(date_array, game_date, game_info, day)
                        var moving_average_data = movingAverage(mappedDataOut, day)

                        var moving_average_data_rearranged = moving_average_data.map((d) =>
                                                             {return {x: d[0], y: d[1]}})

                        var injury_data_rearranged = injury_date.map((d, i) =>
                                                     {return {x: d, y: injury_type[i]}})

                        var holder = []
                        for (let i = 0; i < injury_date.length; i++)
                        {
                            for (let k = 0; k < moving_average_data.length; k++)
                            {
                                if(injury_date[i] == moving_average_data[k][0])
                                {
                                    //console.log(injury_date[i])
                                    holder.push([injury_date[i], moving_average_data[k][1], injury_type[i]])
                                }
                            }
                        }

                        var holder_rearranged = holder.map((d) =>
                                                     {return {x: d[0], y: d[1], z: d[2]}})


                        min_y = d3.min(game_info)
                        max_y = d3.max(game_info)

                        // add the y axis
                        var yScale = d3.scaleLinear()
                                    .domain([min_y, max_y])
                                    //.range([h/2 - 2*pad, 0]);
                                    .range([(h/2 - 2*pad)/7, 0]);

                        var y = d3.axisLeft()
                                  .scale(yScale)
                                  .ticks(5);

                        var yAxis = svg.append("g")
                                       .attr("id", "y-axis-lines-" + i)
                                       .attr("class", "axis")
                                       .attr("transform", "translate(" + (pad) + "," + (i*114.25) + ")")
                                       .call(y);

                        // add the text label for Y axis
                        yAxis.append("text")
                             .attr("id", "y-axis label")
                             .style("fill", "black")
                             .attr("x", -40)
                             .attr("y", -pad*4/5)
                             .attr("transform", "rotate(-90)")
                             .text(setParameter);

                        lines.append("path")
                             .datum(moving_average_data_rearranged)
                             .attr("fill", "none")
                             .attr("stroke", colors[i])
                             .attr("stroke-width", 1.5)
                             .attr("transform", "translate(" + (0) + "," + (pad) + ")")
                             .attr("d", d3.line().x(function(d) {return xScale(new Date(d.x))})
                                                 .y(function(d) {return yScale(d.y)}))
                             .attr("transform", "translate(" + (pad) + "," + (i*114.25) + ")")

                        circles.selectAll("null")
                               .data(holder_rearranged, function(d) { return d; })
                               .enter()
                               .append("circle")
                               .attr("fill", "black")
                               .attr("cx", function(d) {return xScale(new Date(d.x))})
                               .attr("cy", function(d) {return yScale(d.y)})
                               //.attr("cy", function(d) {return yScale(d.y)})
                               .attr("class", "circle")
                               .attr("r", radius)
                               .attr("transform", "translate(" + (0) + "," + (pad) + ")")
                               .attr("id", function(d) {return d.z})
                               .attr("transform", "translate(" + (pad) + "," + (i*114.25) + ")")
                               .on("mouseover", handleMouseOver)
                               .on("mouseout", handleMouseOut)

                    }


                    var svg_summary = d3.select("body")
                                .append("svg")
                                .attr("width", 400)
                                .attr("height", 300)
                                .attr("x", 0)
                                .attr("y", 500)
                                .attr("id", "svg_summary")
                                .attr("transform","translate(400, -1175)")


                    var summary = svg_summary.append("g")
                                              .attr("id", "summary");

                    summary.append("text")
                                       .attr("x", 10)
                                       .attr("y", 10)
                                       .attr("font-size", "14px")
                                       .attr("font-family", "arial")
                                       .attr("fill", "black")
                                       .attr("id", "summary_text")
                                       .text("The top five players by average play time are")

                    summary.append("text")
                                       .attr("x", 50)
                                       .attr("y", 40)
                                       .attr("font-size", "14px")
                                       .attr("font-family", "arial")
                                       .attr("fill", colors[0])
                                       .attr("id", "summary_text")
                                       .text(selectPlayer[0])

                        summary.append("text")
                                       .attr("x", 50)
                                       .attr("y", 60)
                                       .attr("font-size", "14px")
                                       .attr("font-family", "arial")
                                       .attr("fill", colors[1])
                                       .attr("id", "summary_text")
                                       .text(selectPlayer[1])
                    summary.append("text")
                                       .attr("x", 50)
                                       .attr("y", 80)
                                       .attr("font-size", "14px")
                                       .attr("font-family", "arial")
                                       .attr("fill", colors[2])
                                       .attr("id", "summary_text")
                                       .text(selectPlayer[2])

                        summary.append("text")
                                       .attr("x", 50)
                                       .attr("y", 100)
                                       .attr("font-size", "14px")
                                       .attr("font-family", "arial")
                                       .attr("fill", colors[3])
                                       .attr("id", "summary_text")
                                       .text(selectPlayer[3])

                        summary.append("text")
                                       .attr("x", 50)
                                       .attr("y", 120)
                                       .attr("font-size", "14px")
                                       .attr("font-family", "arial")
                                       .attr("fill", colors[4])
                                       .attr("id", "summary_text")
                                       .text(selectPlayer[4])


                        summary.append("text")
                                       .attr("x", 10)
                                       .attr("y", 150)
                                       .attr("font-size", "14px")
                                       .attr("font-family", "arial")
                                       .attr("fill", "black")
                                       .attr("id", "summary_text")
                                       .text("Double-click another cluster to view its data")

                        summary.append("text")
                                       .attr("x", 10)
                                       .attr("y", 170)
                                       .attr("font-size", "14px")
                                       .attr("font-family", "arial")
                                       .attr("fill", "black")
                                       .attr("id", "summary_text")
                                       .text("or select a different parameter to see how injuries")

                        summary.append("text")
                                       .attr("x", 10)
                                       .attr("y", 190)
                                       .attr("font-size", "14px")
                                       .attr("font-family", "arial")
                                       .attr("fill", "black")
                                       .attr("id", "summary_text")
                                       .text("affect performance for the top five players.")





                // var summary = svg_summary.append("g")
                // 				  			  .attr("id", "summary");

                // 	var summary_text = ["The top five players by average play time are - " + selectPlayer[0] + ", -" + selectPlayer[1] + ", -" + selectPlayer[2] + ", -" + selectPlayer[3] + ", -" + selectPlayer[4] + "."]
                // 	console.log(summary_text)

                // 	summary.append("text")
                // 					   .attr("x", 10)
                // 					   .attr("y", 10)
                // 					   .attr("font-size", "12.5px")
                // 					   .attr("font-family", "arial")
                // 					   .attr("fill", "black")
                // 					   .attr("id", "summary_text")
                // 					   .data(summary_text).enter()
                // 					   .text(function(d) {
                // 					    return d.split("-")[0]
                // 					   })
                // 					   .append("tspan")
                //   					   .style("fill", "red")
                //   					   .text(function(d) {
                //                            return d.split("-")[1]
                //                        })

                }

                // update list of injuries based on cluster selected
                function update_injuries(selectPlayer)
                {
                    var injury_dictionary = {}
                    var list_of_injuries = []
                   // console.log(selectPlayer)

                    for (let i = 0; i < selectPlayer.length; i++)
                    {
                        var setName = selectPlayer[i]

                        var game_date = []
                        var game_info = []
                        var injury_date = []
                        var injury_type = []

                        // populate the arrays
                        for (let i = 0; i < game_data_nest.length; i++)
                        {
                            if (game_data_nest[i].key == setName)
                            {
                                for (let k = 0; k < game_data_nest[i].values.length; k++)
                                {
                                    game_date.push(game_data_nest[i].values[k].date)
                                    game_info.push(parseFloat(game_data_nest[i].values[k][setParameter]))
                                }
                            }
                        }

                        for (let i = 0; i < injury_nest.length; i++)
                        {
                            if (injury_nest[i].key == setName)
                            {
                                for (let k = 0; k < injury_nest[i].values.length; k++)
                                {
                                    injury_date.push(injury_nest[i].values[k].date)
                                    injury_type.push(injury_nest[i].values[k].body_injury)
                                }
                            }
                        }

                        injury_dictionary = countInjuries(injury_type, injury_dictionary)
                    }

                    for (const [key, value] of Object.entries(injury_dictionary))
                    {
                         list_of_injuries.push([value, key])
                    }

                    // console.log(list_of_injuries)
                    // list_of_injuries.sort(function (a, b) {
                    //     return b[0] < a[0];
                    // });

                    list_of_injuries.sort(sortFunction);

                    function sortFunction(a, b) {
                        if (a[0] === b[0]) {
                            return 0;
                        }
                        else {
                            return (a[0] > b[0]) ? -1 : 1;
                        }
                    }

                    //console.log(list_of_injuries)
                    return list_of_injuries
                }

                // update body based on updated list of injuries
                function update_body(list_of_injuries)
                {

                var margin = {top:100, right: 0, bottom: 100, left: 0},
                              width = 650 - margin.right - margin.left,
                              height = 800 - margin.top - margin.bottom;

                    d3.select("#svg_body").remove();
                    d3.select("#legend").remove();

                        var svg_body = d3.select("body")
                        .append("svg")
                        .attr("id", "svg_body")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                        .attr('x', 1400)
                        .attr('y', 1000)
                        .attr("transform","translate(900,-1350) scale(0.8)");

                        svg_body.append("svg_body:image")
                        .attr('x', 0)
                        .attr('y', 0)
                        .attr('width', 500)
                        .attr('height', 700)
                        .attr("xlink:href", "/static/images/LeBron.PNG")

                        var non_body_index = []

                        var total_injuries = 0;
                        var idx = 0;

                        var colorvar = d3.scaleSequential().domain([0,list_of_injuries.length]).interpolator(d3.interpolateRainbow);

                        for(idx=0;idx<list_of_injuries.length;idx++) {
                            total_injuries += list_of_injuries[idx][0];
                        }

                        var circles_body = svg_body.selectAll("circle")
                        .data(list_of_injuries)
                        .enter()
                        .append("circle");

                        circles_body.attr("cx", function(d, i) {
                            if(d[1].includes("left foot")) {
                                non_body_index.push(i);
                                return 300;
                            }
                            if(d[1].includes("right foot")) {
                                non_body_index.push(i);
                                return 170;
                            }
                            if(d[1].includes("left knee")) {
                                return 295;
                                non_body_index.push(i);
                            }
                            if(d[1].includes("right knee")) {
                                non_body_index.push(i);
                                return 190;
                            }
                            if(d[1].includes("left leg")) {
                                non_body_index.push(i);
                                return 295;
                            }
                            if(d[1].includes("right leg")) {
                                non_body_index.push(i);
                                return 185;
                            }
                            if(d[1].includes("left hip")) {
                                non_body_index.push(i);
                                return 290;
                            }
                            if(d[1].includes("right hip")) {
                                non_body_index.push(i);
                                return 220;
                            }
                            if(d[1].includes("left arm")) {
                                non_body_index.push(i);
                                return 350;
                            }
                            if(d[1].includes("right arm")) {
                                non_body_index.push(i);
                                return 150;
                            }
                            if(d[1].includes("left hand")) {
                                non_body_index.push(i);
                                return 360;
                            }
                            if(d[1].includes("right hand")) {
                                non_body_index.push(i);
                                return 150;
                            }
                            if(d[1].includes("left shoulder")) {
                                non_body_index.push(i);
                                return 330;
                            }
                            if(d[1].includes("right shoulder")) {
                                non_body_index.push(i);
                                return 170;
                            }
                            if(d[1].includes("back")) {
                                non_body_index.push(i);
                                return 252;
                            }
                            if(d[1].includes("chest")) {
                                non_body_index.push(i);
                                return 252;
                            }
                            if(d[1].includes("head")) {
                                non_body_index.push(i);
                                return 252;
                            }
                            if(d[1].includes("groin")) {
                                non_body_index.push(i);
                                return 252;
                            }
                            if(d[1].includes("neck")) {
                                non_body_index.push(i);
                                return 252;
                            }

                            return -100
                        })
                       .attr("cy", function(d,i) {
                            if(d[1].includes("right foot")) {
                                return 650;
                            }
                            if(d[1].includes("left foot")) {
                                return 650;
                            }
                            if(d[1].includes("right knee")) {
                                return 500;
                            }
                            if(d[1].includes("left knee")) {
                                return 500;
                            }
                            if(d[1].includes("right leg")) {
                                return 575;
                            }
                            if(d[1].includes("left leg")) {
                                return 575;
                            }
                            if(d[1].includes("right hip")) {
                                return 340;
                            }
                            if(d[1].includes("left hip")) {
                                return 340;
                            }
                            if(d[1].includes("right arm")) {
                                return 270;
                            }
                            if(d[1].includes("left arm")) {
                                return 270;
                            }
                            if(d[1].includes("right hand")) {
                                return 390;
                            }
                            if(d[1].includes("left hand")) {
                                return 390;
                            }
                            if(d[1].includes("right shoulder")) {
                                return 160;
                            }
                            if(d[1].includes("left shoulder")) {
                                return 160;
                            }
                            if(d[1].includes("back")) {
                                return 260;
                            }
                            if(d[1].includes("chest")) {
                                return 190;
                            }
                            if(d[1].includes("head")) {
                                return 70;
                            }
                            if(d[1].includes("groin")) {
                                return 380;
                            }
                            if(d[1].includes("neck")) {
                                return 130;
                            }
                            return height/2;
                        })
                        .attr("r", function(d) {
                            if(d[1].includes("right foot")) {
                                return d[0]/total_injuries*100
                            }
                            if(d[1].includes("left foot")) {
                                return d[0]/total_injuries*100
                            }
                            if(d[1].includes("right knee")) {
                                return d[0]/total_injuries*100
                            }
                            if(d[1].includes("left knee")) {
                                return d[0]/total_injuries*100
                            }
                            if(d[1].includes("right leg")) {
                                return d[0]/total_injuries*100
                            }
                            if(d[1].includes("left leg")) {
                                return d[0]/total_injuries*100
                            }
                            if(d[1].includes("right hip")) {
                                return d[0]/total_injuries*100
                            }
                            if(d[1].includes("left hip")) {
                                return d[0]/total_injuries*100
                            }
                            if(d[1].includes("right arm")) {
                                return d[0]/total_injuries*100
                            }
                            if(d[1].includes("left arm")) {
                                return d[0]/total_injuries*100
                            }
                            if(d[1].includes("right hand")) {
                                return d[0]/total_injuries*100
                            }
                            if(d[1].includes("left hand")) {
                                return d[0]/total_injuries*100
                            }
                            if(d[1].includes("right shoulder")) {
                                return d[0]/total_injuries*100
                            }
                            if(d[1].includes("left shoulder")) {
                                return d[0]/total_injuries*100
                            }
                            if(d[1].includes("back")) {
                                return d[0]/total_injuries*100
                            }
                            if(d[1].includes("chest")) {
                                return d[0]/total_injuries*100
                            }
                            if(d[1].includes("head")) {
                                return d[0]/total_injuries*100
                            }
                            if(d[1].includes("groin")) {
                                return d[0]/total_injuries*100
                            }
                            if(d[1].includes("neck")) {
                                return d[0]/total_injuries*100
                            }
                            return 0;
                        })
                        .attr("fill", function(d,i) {

                           return colorvar(i);
                       })
                       .attr("fill-opacity", .4)
                       .attr("id", function(d) {
                         //  console.log("circle_" + d[0].replace(/ /g, ""));
                           return "circle_" + d[1].replace(/ /g, "");
                       })


                        svg_body.append("g")
                        .attr("id","legend")
                        .attr("transform","translate(" + margin.left + 70 + "," + margin.top + ")");

                        var legend = d3.select("#legend");

                        for(let i=0;i<list_of_injuries.length;i++) {
                            legend.append("rect")
                            .attr("width",10)
                            .attr("height",10)
                            .attr("x",400)
                            .attr("y",100 + i*15)
                            .style("fill",colorvar(i))
                            //console.log(colorScheme(i));

                            legend.append("text")
                            .attr("x", 415)
                            .attr("y",100 + i*15 + 10)
                            .text(list_of_injuries[i][1]);

                            legend.append("text")
                            .attr("x", 350)
                            .attr("y",100 + i*15 + 10)
                            .text((list_of_injuries[i][0]/total_injuries*100).toFixed(2) + "%");
                        }

                        hideSpinner();
                }

                }).catch(function(error) {
                  console.log(error);
                });

            }).catch(function(error) {
              console.log(error);
            });

        }).catch(function(error) {
          console.log(error);
        });

    }).catch(function(error) {
      console.log(error);
    });







    console.log('runJS Complete')

};



