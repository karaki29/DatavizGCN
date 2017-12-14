/*
CE SCRIPT CONTIENT LE CODE DU CHARGEMENT DES GRAPHIQUES DANS LA PAGE

  Auteur: 	 Hind MADI
  
  Version: 	 1.0.0
  
  Email: 	 hind.madi1994@gmail.com

*/



//////////////////////////////////////////////////

//VARIABLES GLOBAL

var global_year = "2002";

//Variable de mapping sujet --> chemin du fichier / titre et legende à afficher
var datapath = "data/";
var sujets = {
    densite: {
        chemin: datapath + "Densite population.csv",
        titre: "",
        legende: "Densité",
        unite: "habitants/km2",
        axe_x_valeur: ""
    },
    excedant: {
        chemin: datapath + "Excedant naturel.csv",
        titre: "",
        legende: "",
        unite: "",
        axe_x_valeur: ""
    },
    fecondite: {
        chemin: datapath + "Fecondite.csv",
        titre: "",
        legende: "",
        unite: "",
        axe_x_valeur: "Fecondité"
    },
    mortalite: {
        chemin: datapath + "Mortalite.csv",
        titre: "",
        legende: "",
        unite: "",
        axe_x_valeur: "Mortalité"
    },
    natalite: {
        chemin: datapath + "Natalite.csv",
        titre: "",
        legende: "",
        unite: "",
        axe_x_valeur: "Natalité"
    },
    popul_moy: {
        chemin: datapath + "Population moyenne.csv",
        titre: "",
        legende: "",
        unite: "",
        axe_x_valeur: ""
    },
    popul_tot: {
        chemin: datapath + "Population totale.csv",
        titre: "",
        legende: "Population totale - Effectif",
        unite: "pers",
        axe_x_valeur: ""
    },
    vieillissement: {
        chemin: datapath + "Vieillissement.csv",
        titre: "",
        legende: "",
        unite: "",
        axe_x_valeur: "Vieillissement"
    },
    global: {
        chemin: datapath + "indicateurs global.csv",
        titre: "",
        legende: "",
        unite: "",
        axe_x_valeur: ""
    }
};

///////////////////POUR LA CARTE

//dimensions de la carte
var mapheight = $(document).height() * 0.75;
var mapwidth = $(".col-7").width();

//Objet D3 pour la manipulation geographique
var path = d3.geoPath();

//objet de projection sur la carte de la france
/*var projectionfr = d3.geoConicConformal() // Lambert-93
    .center([2.454071, 46.279229]) // Center on France
    .scale([height * 5])
    .translate([width / 2, height / 2]);*/

var projectionfr = d3.geoMercator().center([2.454071, 46.279229]) // Center on France
    .scale([mapwidth * 2.3])
    .translate([mapwidth / 2, mapheight / 2]);


// Liaison de la projection avec l'objet D3 path
path.projection(projectionfr);

// ajouter la balise svg qui contiendra l'affichage de la carte
var mapsvg = d3.select('#map').append("svg")
    .attr("id", "mapsvg")
    .attr("width", mapwidth)
    .attr("height", mapheight)
    .attr("transform", "translate(0,20)");

// Ajouter la balise g au svg
var mapdeps = mapsvg.append("g");

// Créer le popup d'information qui s'affichera lorsqu'on pointe sur une région
var tooltipdiv = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);


//Fonction de chargement des données dans la carte
function loadMapData(year) {
    global_year = year;
    updatetitre();
    //Mise à jour des surfaces de la carte
    d3.csv(sujets.popul_tot.chemin, function (error, data) {

        var mapcolors = d3.scaleQuantile()
            .domain([d3.min(data, function (e) {
                return +e[year];
            }), d3.max(data, function (e) {
                return +e[year];
            })])
            .range(d3.range(8).map(function (i) {
                return "mapclass q" + i + "-8";
            }));

        var paths = mapsvg.select('g')
            .selectAll("path")
            .data(data);

        paths.attr("class", function (d) {
                return mapcolors(d[year]);
            })
            .attr("reg_id", function (d) {
                return d.reg_code;
            })
            .on("mouseover", function (d) {
                tooltipdiv.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltipdiv.html("Région : " + d.reg_code + " - " + d.reg_name + "<br>" + sujets.popul_tot.legende + " : " + d[year] + " " + sujets.popul_tot.unite)
                    .style("left", (d3.event.pageX + 30) + "px")
                    .style("top", (d3.event.pageY - 30) + "px")
            })
            .on("mouseout", function (d) {
                tooltipdiv.transition()
                    .duration(500)
                    .style("opacity", 0);
                tooltipdiv.html("")
                    .style("left", "0px")
                    .style("top", "0px")
            });

    });

    //Ajout des cercles
    d3.queue()
        .defer(d3.csv, sujets.densite.chemin)
        .defer(d3.json, "json/regions_before_2015.geojson")
        .await(function (error, sujet, regions) {
            $('circle').remove();

            //Fonction définie pour créer les quantiles. Elle retourne l'index du quantile selon la valeur de la donnée.
            var mapCircle = d3.scaleQuantile()
                .domain([d3.min(sujet, function (e) {
                    return +e[year];
                }), d3.max(sujet, function (e) {
                    return +e[year];
                })])
                .range(d3.range(4).map(function (i) { // le i represente l'index qu'on multiplie par 5 et on y ajoute 5 pour que ça soit utilisé en tant que le rayon des cercles qu'on dessine.
                    return 5 + i * 5;
                }));

            //Afficher les quantiles crées
            console.log(mapCircle.quantiles());

            var valueByCode = {};
            sujet.forEach(function (d) {
                valueByCode[d.reg_code] = {
                    name: d.reg_name,
                    value: +d[year]
                };
            });

            mapsvg.selectAll("svg")
                .data(regions.features) // pour chaque ligne du tableau regions.features
                .enter()
                .append("g") // on ajoute une balise g à mapsvg
                .append("circle") // on ajoute une balise cercle dans le "g"
                .attr("transform", function (d) { // On specifie les cordonnées où sera dessiner le cercle en prenant le centroid de la surface de la region
                    return "translate(" + path.centroid(d) + ")";
                })
                .attr("id", function (d) { // on ajoute un id
                    return "circ_r" + d.properties.code;
                })
                .attr("reg_id", function (d) {
                    return d.properties.code;
                })
                .attr("class", "node") // on ajoute la classe
                .attr('fill', 'blue') // on remplit par la couleur bleu
                .attr('opacity', 0.8) // on definit la trensparence
                .attr('r', function (d) {
                    if (valueByCode[d.properties.code].value == 0) 
                            return 0;
                        else return mapCircle(valueByCode[d.properties.code].value);
                })
                .on("mouseover", function (d) {
                    tooltipdiv.transition()
                        .duration(200)
                        .style("opacity", .9);
                    tooltipdiv.html("Région : " + d.properties.code + " - " + valueByCode[d.properties.code].name + "<br>" + sujets.densite.legende + " : " + valueByCode[d.properties.code].value + " " + sujets.densite.unite)
                        .style("left", (d3.event.pageX + 30) + "px")
                        .style("top", (d3.event.pageY - 30) + "px")
                })
                .on("mouseout", function (d) {
                    tooltipdiv.transition()
                        .duration(500)
                        .style("opacity", 0);
                    tooltipdiv.html("")
                        .style("left", "0px")
                        .style("top", "0px");
                })
                .on("click", function (d) {
                    loadChartData(year, d.properties.code);
                });

            mapsvg.selectAll('g #circ_' + "r94").remove();

        });
};

///////////////////POUR LE GRAPHIQUE



var chartmargin = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20
}

var chartheight = $(document).height() * 0.7 - chartmargin.top - chartmargin.bottom;
var chartwidth = $(".col-5").width() - 120;


var x = d3.scaleBand().rangeRound([0, chartwidth]).padding(0.1);

var y = d3.scaleLinear().rangeRound([chartheight - 20, 0]);




function loadChartData(year, code) {
    global_year = year;
    updatetitre();
    
    $("#chart").empty();
    var chartsvg = d3.select("#chart").append("svg")
        .attr("width", chartwidth + chartmargin.right + chartmargin.left)
        .attr("height", chartheight + chartmargin.top + chartmargin.bottom)
        .attr("transform", "translate(" + chartmargin.left + "," + chartmargin.top + ")");


    d3.queue()
        .defer(d3.csv, sujets.fecondite.chemin)
        .defer(d3.csv, sujets.mortalite.chemin)
        .defer(d3.csv, sujets.natalite.chemin)
        .defer(d3.csv, sujets.vieillissement.chemin)
        .defer(d3.csv, sujets.global.chemin)
        .await(function (error, fecondite, mortalite, natalite, vieillissement, global) {

            var dataregionArray = [];

            if (code != null) {
                for (i = 0; i < fecondite.length; i++) {
                    if (fecondite[i].reg_code == code) {
                        dataregionArray.push({
                            titre: sujets.fecondite.axe_x_valeur,
                            value_region: +fecondite[i][year] / 100,
                            value_global: +global[0][year] / 100
                        }, {
                            titre: sujets.natalite.axe_x_valeur,
                            value_region: +natalite[i][year] / 100,
                            value_global: +global[1][year] / 100
                        }, {
                            titre: sujets.vieillissement.axe_x_valeur,
                            value_region: +vieillissement[i][year] / 100,
                            value_global: +global[2][year] / 100
                        }, {
                            titre: sujets.mortalite.axe_x_valeur,
                            value_region: +mortalite[i][year] / 100,
                            value_global: +global[3][year] / 100
                        });
                    }
                }
            } else {
                dataregionArray.push({
                    titre: sujets.fecondite.axe_x_valeur,
                    value_global: +global[0][year] / 100
                }, {
                    titre: sujets.natalite.axe_x_valeur,
                    value_global: +global[1][year] / 100
                }, {
                    titre: sujets.vieillissement.axe_x_valeur,
                    value_global: +global[2][year] / 100
                }, {
                    titre: sujets.mortalite.axe_x_valeur,
                    value_global: +global[3][year] / 100
                });
            }


            //console.log("dataregion : " + JSON.stringify(dataregionArray));

            x.domain(dataregionArray.map(function (d) {
                return d.titre;
            }));

            /*var max_value_y = d3.max([d3.max(dataregionArray, function (d) {
                    return +d.value_region;
                }),
                d3.max(dataregionArray, function (d) {
                    return +d.value_global;
                })]);*/

            // console.log(Math.floor(max_value_y) + 1);

            y.domain([0, 1]);

            chartsvg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(30," + chartheight + ")")
                .call(d3.axisBottom(x));

            chartsvg.append("g")
                .attr("class", "y axis")
                .attr("height", chartheight)
                .attr("transform", "translate(35,20)")
                .call(d3.axisLeft(y).ticks(20, "%"))
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end").text("Pourcentage");

            var g = chartsvg.selectAll(".bar")
                .data(dataregionArray)
                .enter();

            g.append("rect")
                .attr("class", "bar bar_global")
                .attr("transform", "translate(30,0)")
                .attr("x", function (d) {
                    return x(d.titre);
                })
                .attr("y", function (d) {
                    return y(+d.value_global);
                })
                .attr("width", x.bandwidth())
                .attr("height", function (d) {
                    return chartheight - y(+d.value_global);
                })
                .on("mouseover", function (d) {
                    tooltipdiv.transition()
                        .duration(200)
                        .style("opacity", .9);
                    tooltipdiv.html("Taux national : " + Math.round(d.value_global * 10000) / 100 + "%")
                        .style("left", (d3.event.pageX + 30) + "px")
                        .style("top", (d3.event.pageY - 30) + "px")
                })
                .on("mouseout", function (d) {
                    tooltipdiv.transition()
                        .duration(500)
                        .style("opacity", 0);
                    tooltipdiv.html("")
                        .style("left", "0px")
                        .style("top", "0px")
                });

            if (code != null) {
                g.append("rect")
                    .attr("transform", "translate(30,0)")
                    .attr("class", "bar bar_reg")
                    .attr("x", function (d) {
                        return x(d.titre) + 10; // center it
                    }).attr("y", function (d) {
                        return y(+d.value_region);
                    })
                    .attr("width", x.bandwidth() - 20) // make it slimmer
                    .attr("height", function (d) {
                        return chartheight - y(+d.value_region);
                    })
                    .on("mouseover", function (d) {
                        tooltipdiv.transition()
                            .duration(200)
                            .style("opacity", .9);
                        tooltipdiv.html("Taux regional: " + Math.round(d.value_region * 10000) / 100 + "%")
                            .style("left", (d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY) + "px")
                    })
                    .on("mouseout", function (d) {
                        tooltipdiv.transition()
                            .duration(500)
                            .style("opacity", 0);
                        tooltipdiv.html("")
                            .style("left", "0px")
                            .style("top", "0px")
                    });
            }

        });
};

function updatetitre(){
    $("#titre").html("Principaux indicateurs démographiques de l'année : " + global_year);
}

$(document).ready(function () {

    // Add regions
    d3.json("json/regions_before_2015.geojson", function (error, regions) {
        mapdeps.selectAll("path")
            .data(regions.features)
            .enter()
            .append("path")
            .attr('id', function (d) {
                return "r" + d.properties.code;
            })
            .attr("d", path)
            .style("stroke", "grey");

        /* Retirer Corsica de la carte */
        mapdeps.selectAll('g #' + "r94").remove();

        // Load some data

        loadMapData(global_year);
        loadChartData(global_year);
        
        $('#intro').modal('show');
    });

});

$(document).on('click', 'path[reg_id]', function () {
    //alert('you clicked here ' + $(this).attr('id').substr(1, 2));
    loadChartData(global_year, $(this).attr('reg_id'));
});
