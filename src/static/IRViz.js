var uploadDiv = document.getElementById('upload');
$.get("/upload", function(data) {
console.log(data);
uploadDiv.innerHTML=data;
})

var graphDiv = document.getElementById('tester'),
data = [{x: [], y:[]}],
layout = {};


Plotly.newPlot(graphDiv, data, layout);

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