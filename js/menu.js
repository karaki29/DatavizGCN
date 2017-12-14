/*
CE SCRIPT CONTIENT LE CODE QUI CONCERNE L'AFFICHAGE DU MENU

  Auteur: 	 Hind MADI
  
  Version: 	 1.0.0
  
  Email: 	 hind.madi1994@gmail.com

*/

//////////////////MENU/////////////////////

var menu = CMenu("#menu_list")
    .config({
        menus: [
            {
                title: "2002",
                click: function () {
                    loadMapData('2002');
                    loadChartData('2002')
                }
            },
            {
                title: "2003",
                click: function () {
                    loadMapData('2003');
                    loadChartData('2003')
                }
            },
            {
                title: "2004",
                click: function () {
                    loadMapData('2004');
                    loadChartData('2004')
                }
            },
            {
                title: "2005",
                click: function () {
                    loadMapData('2005');
                    loadChartData('2005')
                }
            },
            {
                title: "2006",
                click: function () {
                    loadMapData('2006');
                    loadChartData('2006')
                }
            },
            {
                title: "2007",
                click: function () {
                    loadMapData('2007');
                    loadChartData('2007')
                }
            },
            {
                title: "2008",
                click: function () {
                    loadMapData('2008');
                    loadChartData('2008')
                }
            },
            {
                title: "2009",
                click: function () {
                    loadMapData('2009');
                    loadChartData('2009')
                }
            },
            {
                title: "2010",
                click: function () {
                    loadMapData('2010');
                    loadChartData('2010')
                }
            },
            {
                title: "2011",
                click: function () {
                    loadMapData('2011');
                    loadChartData('2011')
                }
            },
            {
                title: "2012",
                click: function () {
                    loadMapData('2012');
                    loadChartData('2012')
                }
            }
        ]
    });



$(document).click(function () {
    menu.hide();
});
$(document).contextmenu(function (e) {
    menu.show([e.pageX, e.pageY]);
    return false;
});