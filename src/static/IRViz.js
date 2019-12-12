var multipleDiv = document.getElementById('multiple'),
data = [{x: [], y:[]}],
layout = {};

Plotly.newPlot(multipleDiv, data, layout);

$.get("/experiments", function(data){
var data_json = JSON.parse(data);
console.log(data_json.experiments.length);

var xaxes = [];
var yaxes = [];
var multipleData = [];

var xaxis = [];
var yaxis = [];

function getData(id) {
var response = '';
$.ajax({
        url: "/experiment/"+data_json.experiments[id],
        data: { id:id },
        async: false,
         success : function(text)
         {
             response = text;
         }
    })
    return response;
}
console.log(getData(1));

for(var i = 0; i < data_json.experiments.length; i++){
console.log(data_json.experiments[i]);
var stats_json = '';
var experimentID = i;

var data = getData(i);
stats_json = JSON.parse(data);
experimentID = i;

console.log(stats_json);
xaxis = [];
yaxis = [];
for(var key in stats_json.data.score){
    xaxis.push(stats_json.data.query_number[key]);
    yaxis.push(stats_json.data.score[key]);
}

xaxes[experimentID] = xaxis;
yaxes[experimentID] = yaxis;

console.log(i, xaxes);
multipleData[experimentID] =
{
x: xaxes[experimentID],
y: yaxes[experimentID],
type: 'line',
name: data_json.experiments[experimentID]
};

multipleDiv.data = multipleData;

multipleDiv.layout = {
 yaxis: {title : {text: "MAP"}},
 xaxis: {title : {text: 'Query ID'} },
 showlegend: true,
 legend: {
    x: 0,
    y: 1.1,
   font: {
      family: 'sans-serif',
      size: 18,
      color: '#000'
    }},
 margin: {t: 1}
 }
Plotly.react(multipleDiv, multipleDiv.data, multipleDiv.layout);

}
})


var firstDiv = document.getElementById('choose-first');
var secondDiv = document.getElementById('choose-second');

$.get("/experiments", function(data){
var experiments_json = JSON.parse(data);
console.log(experiments_json);
var options_string = '';
for(var i = 0; i < experiments_json.experiments.length; i++){
options_string = options_string+ "<option>"+experiments_json.experiments[i]+"</option>";
}
firstDiv.innerHTML = "<b>First experiment: </b> <select id=\"option1\" autofocus> " + options_string + " </select>";
secondDiv.innerHTML = "<b>Second experiment: </b> <select id=\"option2\" autofocus> " + options_string + " </select>";
})

var graphDiv = document.getElementById('tester'),
data = [{x: [], y:[]}],
layout = {};

Plotly.newPlot(graphDiv, data, layout);

$(document).ready(function() {
$('#target').submit(function(event1){
event1.preventDefault();
console.log("reaching here?");
var experiment1 = document.getElementById("option1").value;
var experiment2 = document.getElementById("option2").value;
console.log(experiment2);
console.log(experiment1);

var pdiv = document.getElementById('statsig');

$.get("/compare/"+experiment1+"/"+experiment2, function(data) {
stats_json = JSON.parse(data);
console.log(stats_json.ttest.pvalue);
var pvalue = stats_json.ttest.pvalue.toFixed(2);
var statsigstr = "";

if (pvalue < 0.01){
statsigstr = "<p style=\"background-color:palegreen; display:inline-flex\"> <b> p="+pvalue+"* <0.01 SIGNIFICANT </b></p>";
}
else if (pvalue < 0.05){
statsigstr = "<p style=\"background-color:palegreen; display:inline-flex\"> <b> p="+pvalue+"* <0.05 SIGNIFICANT </b></p>";
}
else{
statsigstr = "<p style=\"background-color:lightblue; display:inline\"> <b> p="+pvalue+" >0.05 NOT SIGNIFICANT </b></p>";
}

pdiv.innerHTML = statsigstr;
var xaxis = [];
var yaxis = [];
var xaxis2 = [];
var yaxis2 = [];
for(var key in stats_json.merged_data.score){
    xaxis.push(stats_json.merged_data.query_number[key]);
    yaxis.push(stats_json.merged_data.score[key]);
    xaxis2.push(stats_json.merged_data.query_number_q2[key]);
    yaxis2.push(stats_json.merged_data.score_q2[key]);
}

graphDiv.data = [
{
x: xaxis,
y: yaxis,
type: 'bar',
name: experiment1
},
{
x:xaxis2,
y:yaxis2,
type: 'bar',
name: experiment2
}
];

graphDiv.layout = {
 yaxis: {title : {text: stats_json.merged_data.metric_type[3]}},
 xaxis: {title : {text: 'Query ID'} },
 showlegend: true,
 legend: {
    x: 0,
    y: 1.1,
   font: {
      family: 'sans-serif',
      size: 18,
      color: '#000'
    }},
 margin: {t: 1}
 }
Plotly.react(graphDiv, graphDiv.data, graphDiv.layout);
 $("#mySelect").on('change', function(event){
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
 yaxis: {title : {text: stats_json.merged_data.metric_type[3]}},
 xaxis: {title : {text: 'Query ID'} },
 showlegend: true,
  legend: {
    x: 0,
    y: 1.1
  },
  font: {
      family: 'sans-serif',
      size: 18,
      color: '#000'
    },
 margin: {t: 1},
 annotations: [
    {
      x: 5,
      y: stats_json.merged_stats[0][stat_value],
      xref: 'x',
      yref: 'y',
      text: selected_stat+":"+stats_json.merged_stats[0][stat_value],
      showarrow: true,
      arrowhead: 7
    },
      {
      x: 8,
      y: stats_json.merged_stats[1][stat_value],
      xref: 'x',
      yref: 'y',
      text: selected_stat+":"+stats_json.merged_stats[1][stat_value],
      showarrow: true,
      arrowhead: 7
    }
 ],
 shapes: [
     {
      type: 'line',
      x0: 1,
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
      x0: 1,
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
console.log(stats_json.merged_stats[0]);
Plotly.react(graphDiv, graphDiv.data, graphDiv.layout);
})
})
})
})