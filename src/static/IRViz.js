var uploadDiv = document.getElementById('upload');

var graphDiv = document.getElementById('tester'),
data = [{x: [], y:[]}],
layout = {};

Plotly.newPlot(graphDiv, data, layout);

var experiment1 = "";
var experiment2 = "";
$.get("/experiments", function(data) {
data_json = JSON.parse(data);
experiment1 = data_json.experiments[0];
experiment2 = data_json.experiments[1];
console.log(experiment2);
console.log(experiment1);

$.get("/compare/"+experiment1+"/"+experiment2, function(data) {
stats_json = JSON.parse(data);
console.log(stats_json.merged_data.score);
var xaxis = [];
var yaxis = [];
var xaxis2 = [];
var yaxis2 = [];
for(var key in stats_json.merged_data.score){
    xaxis.push(stats_json.merged_data.query_number[key]);
    yaxis.push(stats_json.merged_data.score[key]);
    xaxis2.push(stats_json.merged_data.query_number_q2[key]);
    yaxis2.push(stats_json.merged_data.score_q2[key]);
    console.log(key, stats_json.merged_data.score[key]);
}

graphDiv.data = [
{
x: xaxis,
y: yaxis,
type: 'line',
name: experiment1
},
{
x:xaxis2,
y:yaxis2,
type: 'line',
name: experiment2
}
];

graphDiv.layout = {
 title: 'Scores for '+experiment1+" and "+experiment2,
 yaxis: {title : {text: stats_json.merged_data.metric_type[3]}},
 xaxis: {title : {text: 'Query ID'} }
 }
Plotly.react(graphDiv, graphDiv.data, graphDiv.layout);
 $("select").on('change', function(event){
 var selected_stat = document.getElementById("mySelect").value;
 if (selected_stat == 'Average'){
 stat_value = 'mean';
 }
 else if (selected_stat == 'Median'){
 stat_value = '50%'
 }
 else if (selected_stat == 'SD') {
 stat_value = 'std'
 }
 else if (selected_stat == 'MAD') {
 stat_value = 'min'
 }
 else {
 stat_value = 'mean'
 }

 graphDiv.layout = {
 title: 'Scores for '+experiment1+" and "+experiment2,
 yaxis: {title : {text: stats_json.merged_data.metric_type[3]}},
 xaxis: {title : {text: 'Query ID'} },
 annotations: [
    {
      x: 5,
      y: stats_json.merged_stats[0][stat_value],
      xref: 'x',
      yref: 'y',
      text: selected_stat+":"+stats_json.merged_stats[0][stat_value],
      showarrow: true,
      arrowhead: 7,
      ax: 0,
      ay: -40
    },
      {
      x: 8,
      y: stats_json.merged_stats[1][stat_value],
      xref: 'x',
      yref: 'y',
      text: selected_stat+":"+stats_json.merged_stats[1][stat_value],
      showarrow: true,
      arrowhead: 7,
      ax: 0,
      ay: -40
    }
 ],
 shapes: [
     {
      type: 'line',
      x0: 0,
      y0: stats_json.merged_stats[0][stat_value],
      x1: 10,
      y1: stats_json.merged_stats[0][stat_value],
      line: {
        color: '#1f77b4',
        dash: 'dashdot'
      }
    },
      {
      type: 'line',
      x0: 0,
      y0: stats_json.merged_stats[1][stat_value],
      x1: 10,
      y1: stats_json.merged_stats[1][stat_value],
      line: {
        color: '#ff7f0e',
        dash: 'dashdot'
      }
    }
 ]
 }
Plotly.react(graphDiv, graphDiv.data, graphDiv.layout);
})
})
})


var egDiv = document.getElementById('topslider');

console.log("did anything happen1??");
var form_upload = document.getElementById('file-upload');
$(document).ready(function() {
$(form_upload).on('submit', function(event){
var fileInput = document.getElementById('the-file');
var file = fileInput.files[0];
var formData = new FormData();
formData.append('file', file);
console.log("did anything happen2??");
$.ajax({
type: "POST",
url: "upload",
data: formData,
contentType: "application/json",
async: false,
cache: false,
contentType: false,
enctype: 'multipart/form-data',
processData: false,
success: function (response) {
console.log(Date.now());
console.log(response);
},
error: function (error) {
console.log(error);
}
});
});
});

/*
$.get("/data", function(data){
console.log(data)
myfunction(data);
})


function myfunction(data){
var xaxis = []
var yaxis = []
response_json = JSON.parse(data);
for (i=0; i < response_json.length; i++){
        xaxis.push(response_json[i].country)
        yaxis.push(response_json[i].total_usd)
}


graphDiv.data = [
{
        x: xaxis,
        y: yaxis,
        type: 'bar'
}
];

graphDiv.layout = {
title: 'Total trade (in USD) of edible commodities for top countries',
yaxis: {title : {text: 'Trade in USD'}, range: [0,160000000000]}
};

Plotly.react(graphDiv, graphDiv.data, graphDiv.layout);
}
*/

/*
$(document).ready(function() {

$("select").on('change', function(event){
var yearvalue = document.getElementById("year-value").value;
var dataToBeSent = document.getElementById("mySelect").value;

$.ajax({
type: "POST",
url: "send_data",
contentType: "application/json",
data: JSON.stringify([dataToBeSent, yearvalue, $top.data("from"), $top.data("to")]),
dataType: "json",
success: function (response) {
console.log(Date.now());

myfunction(response);
},
error: function (error) {
console.log(error);
}
});
});
});
*/