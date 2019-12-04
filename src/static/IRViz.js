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
 yaxis: {title : {text: stats_json.merged_data.metric_type[3]}},
 xaxis: {title : {text: 'Query ID'} },
 showlegend: true,
 legend: {
    x: 0,
    y: 1.1,
   font: {
      family: 'sans-serif',
      size: 14,
      color: '#000'
    }},
 margin: {t: 1}
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
 yaxis: {title : {text: stats_json.merged_data.metric_type[3]}},
 xaxis: {title : {text: 'Query ID'} },
 showlegend: true,
  legend: {
    x: 0,
    y: 1.1
  },
  font: {
      family: 'sans-serif',
      size: 14,
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
      y0: stats_json.merged_stats[0][stat_value],
      y1: stats_json.merged_stats[0][stat_value],
      line: {
        color: '#1f77b4',
        dash: 'dashdot'
      }
    },
      {
      type: 'line',
      y0: stats_json.merged_stats[1][stat_value],
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
