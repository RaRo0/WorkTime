var table;
var isLoad = false
var reloader;
var g;
var rawdata;
var mainparam=0;
$(document).ready(function () {
    $("#month").click(function () {
        mainparam=0;
        handleData(rawdata)
    })
    $("#lastmonth").click(function () {
         mainparam=-1;
        handleData(rawdata)
    })
    $("#week").click(function () {
         mainparam="week";
        handleData(rawdata)
    })
    $("#all").click(function () {
         mainparam=null;
        handleData(rawdata)
    })
    reloader = window.setInterval(function () {loadData()}, 20 * 1000);
    loadData();
});
function loadData() {

    $.get("data.json", function(data){
    isLoad=true;
    rawdata=data;
    handleData(data,0);
    });
}
function log(data) {
    console.log(data);
}


function formartTime(d, t = 0) {
    switch (t) {
        case 1:
            return ((Math.floor(d.getTime() / 1000 / 60 / 60))).toString().padStart(2, "0") + ":" + d.getMinutes().toString().padStart(2, "0") + ":" + d.getSeconds().toString().padStart(2, "0")
            break;
        case 2:
            return (d.getHours() - 1).toString().padStart(2, "0") + ":" + d.getMinutes().toString().padStart(2, "0") + ":" + d.getSeconds().toString().padStart(2, "0")
            break;
        default:
            return (d.getHours()).toString().padStart(2, "0") + ":" + d.getMinutes().toString().padStart(2, "0") + ":" + d.getSeconds().toString().padStart(2, "0")
            break;
    }

}
function formartDate(dateString) {
    log(dateString)
    var tmp = dateString.split(".");
    dateString="";
    for(t of tmp)
    {
        log(t)
        dateString+=t.toString().padStart(2, "0")+"."
    }
    return dateString.substr(0,dateString.length-1)
}

function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return [d.getUTCFullYear(), weekNo];
}

function handleData(data) {
    isLoad = true;
    var arr = [];
    var timeData = [];
    var min;
    var max;
    var total = 0;
    var vaild = true;
    for (t in data["times"]) {
        var tmpData = data["times"][t];
        var d = new Date(Date.parse(tmpData["day"]))
        vaild = true;
        if (mainparam != null) {
            if (mainparam == "week") {
                if (getWeekNumber(d)[1] != getWeekNumber(new Date())[1]) {
                    vaild = false;
                }
            } else if (d.getMonth() != (new Date()).getMonth() + mainparam) {
                vaild = false;
            }
        }
        if (vaild) {
            var tmp_d = d;
            var date = formartDate((d).toLocaleDateString("de"))
            d = new Date(Date.parse(tmpData["start"]))
            var start = formartTime(d)
            d = new Date(Date.parse(tmpData["end"]))
            var end = formartTime(d)
            d = d - new Date(Date.parse(tmpData["start"]))
            var tmp_time = Math.round((d) / (1000 * 60));
            d = new Date(d)
            var time = formartTime(d, 2)
            if (min > tmp_time || min == undefined) {
                min = tmp_time
            }
            if (max < tmp_time || max == undefined) {
                max = tmp_time
            }
            total += tmp_time;
            log(min)
            log(max)
            arr.push([tmp_d, tmp_time])
            timeData.push([date, start, end, time])
        }
    }
    $("#min")[0].innerText = "Min : " + formartTime(new Date(min * (1000 * 60)),1);
    $("#max")[0].innerText = "Max : " + formartTime(new Date(max * (1000 * 60)),1);
    $("#total")[0].innerText = "Total : " + formartTime(new Date(total * (1000 * 60)), 1);

    if (!table) {
        drawTable(timeData);
    } else {
        redrawTable(timeData);
    }
    makeGraph(arr);
}

function redrawTable(timeData) {
    table.clear();
    table.rows.add(timeData);
    table.draw();

}

function drawTable(timeData) {
    table = $('#mytable').DataTable(
        {
            data: timeData,
            paging:false,
            "info": false,
            columns: [
                {title: "Date"},
                {title: "Start"},
                {title: "End"},
                {title: "Time"}
            ],
            "ordering": false,
            "searching": false,
            "columnDefs": [
                {"className": "dt-center", "targets": "_all"}
            ]
        });
}

function makeGraph(arr) {
    if (g) {
        g.destroy();
    }
    var start = new Date(arr[0]);
    start = start.setDate(start.getDate() - 1);

    var end = new Date(arr[arr.length - 1]);
    end = end.setDate(end.getDate() + 1);
    if (arr.length == 1) {
        arr.push([new Date(0), 0])
    }
    var arrMax=[];
    for(a of arr)
    {
        arrMax.push(a[1])
    }
    var max = Math.max.apply(null, arrMax)+60;
    g = new Dygraph(document.getElementById("graph"),
        arr,
        {
            labels: ["Datum", "Zeit in Minuten"],
            plotter: barChartPlotter,
            axes: {x: {drawGrid: false}},
            dateWindow: [start, end],
            color: "#3f89ff",
            valueRange: [0, max]
        });
}

function barChartPlotter(e) {
    var ctx = e.drawingContext;
    var points = e.points;
    var y_bottom = e.dygraph.toDomYCoord(0);

    ctx.fillStyle = darkenColor(e.color);

    // Find the minimum separation between x-values.
    // This determines the bar width.
    var min_sep = Infinity;
    for (var i = 1; i < points.length; i++) {
        var sep = points[i].canvasx - points[i - 1].canvasx;
        if (sep < min_sep) min_sep = sep;
    }
    var bar_width = Math.floor(2.0 / 3 * min_sep);

    // Do the actual plotting.
    for (var i = 0; i < points.length; i++) {
        var p = points[i];
        var center_x = p.canvasx;

        ctx.fillRect(center_x - bar_width / 2, p.canvasy,
            bar_width, y_bottom - p.canvasy);

        ctx.strokeRect(center_x - bar_width / 2, p.canvasy,
            bar_width, y_bottom - p.canvasy);
    }
}

function darkenColor(colorStr) {
    // Defined in dygraph-utils.js
    var color = Dygraph.toRGB_(colorStr);
    color.r = Math.floor((255 + color.r) / 2);
    color.g = Math.floor((255 + color.g) / 2);
    color.b = Math.floor((255 + color.b) / 2);
    return 'rgb(' + color.r + ',' + color.g + ',' + color.b + ')';
}
