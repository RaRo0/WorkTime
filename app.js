var table;
var isLoad=false
var reloader;
var mainparam;
$(document).ready( function () {
$("#month").click(function () {
    setDataToMonth(0)
})
$("#lastmonth").click(function () {
    setDataToMonth(-1)
})
$("#all").click(function () {
    setDataToMonth(null)
})
});
function setDataToMonth(data) {
    if(!isLoad)
    {
        return
    }
    handleFiles(data)

}
function log(data) {
  console.log(data);
}
function handleFiles(params) {
   if(reloader!=undefined)
   {
        clearInterval(reloader);
   }
   mainparam= params;
  reloader = window.setInterval(function () {
    readFile()
    }
  ,20*1000);
  readFile()
}
function readFile() {
  var file = document.getElementById('input').files[0];
    if (file) {

      getAsText(file);
    }
}

function getAsText(readFile) {

  var reader = new FileReader();

  // Read file into memory as UTF-16
  reader.readAsText(readFile, "UTF-8");

  reader.onload = loaded;
}
function loaded(evt) {
  // Obtain the read file data
  var fileString = evt.target.result;
  var data = JSON.parse(fileString);
  handleData(data)
}
function formartDate(d,t=false) {
    if(t)
    {
        return(Math.floor(d.getTime()/1000/60/60)).toString().padStart(2,"0")+":"+ d.getMinutes().toString().padStart(2,"0")+":"+ d.getSeconds().toString().padStart(2,"0")
    }
    return(d.getHours()-1).toString().padStart(2,"0")+":"+ d.getMinutes().toString().padStart(2,"0")+":"+ d.getSeconds().toString().padStart(2,"0")
}
function handleData(data) {
  isLoad=true;
  var arr=[];
  var timeData=[];
  var min;
  var max;
  var total=0;
  for(t in data["times"])
  {
    var tmpData=data["times"][t];
    var d = new Date(Date.parse(tmpData["day"]))
    if(mainparam!=null)
    {
        if(d.getMonth()!=(new Date()).getMonth()+mainparam)
        {
            break;
        }
    }
    var tmp_d=d;
    var date =(d).toLocaleDateString()
    d = new Date(Date.parse(tmpData["start"]))
    var start = formartDate(d)
    d = new Date(Date.parse(tmpData["end"]))
    var end = formartDate(d)
    d= d- new Date(Date.parse(tmpData["start"]))
    var tmp_time =Math.round((d)/(1000*60));
    d= new Date(d)
    var time= formartDate(d)
    if(min>tmp_time||min==undefined)
    {
      min=tmp_time
    }
    if(max<tmp_time||max==undefined)
    {
      max=tmp_time
    }
    total+=tmp_time;
    log(min)
    log(max)
    arr.push([tmp_d,tmp_time])
    timeData.push([date,start,end,time])
  }
  $("#min")[0].innerText="Min : "+formartDate(new Date(min*(1000*60)));
  $("#max")[0].innerText="Max : "+formartDate(new Date(max*(1000*60)));
  $("#total")[0].innerText="Total : "+formartDate(new Date(total*(1000*60)),true);

  if(!table) {
    drawTable(timeData);
  }
  else
  {
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
          columns: [
            { title: "Date" },
            { title: "Start" },
            { title: "End" },
            { title: "Time" }
          ],
          "searching": false,
          "columnDefs": [
            {"className": "dt-center", "targets": "_all"}
          ]
        });
}
function makeGraph(arr) {

  g = new Dygraph(document.getElementById("graph"),
                  arr,
                 {
                labels: [ "Datum", "Zeit in Minuten"],
                   plotter: barChartPlotter,
                   axes: {x: {drawGrid: false}},
                   dateWindow: [ new  Date().setDate(new Date(arr[0]).getDate()-2),new  Date().setDate(new Date(arr[arr.length-1]).getDate()+1)]
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
