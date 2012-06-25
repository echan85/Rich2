
var map = null;
var squares = null;
var gridSize = 48;
var canvasWidth = 1728;
var canvasHeight = 1728;
var landList = new Array();
var bx;
var by;
var context;

$(function() {  
  $("#detail").hide();
  var canvas = document.getElementById("map");
  context = canvas.getContext('2d');
  
  $("#map").click(function(e){
    var mx = e.pageX
    var my = e.pageY;
    console.log("mouse " + mx + " " + my);
    bx = Math.floor(mx / gridSize);
    by = Math.floor(my / gridSize);
    console.log("block " + bx + " " + by);
    $("#detail").show();
  });
  
  var img = new Image();
  img.src = "image/taiwan.png";
  context.drawImage(img, 0, 0);
  console.log("draw minimap a");

  context.beginPath();
  context.strokeStyle = 'rgba(30,0,0)';
  for (var i=1; i<36; ++i) {
    context.moveTo(0, gridSize * i);
    context.lineTo(canvasWidth, gridSize * i);
  }
  for (var i=1; i<36; ++i) {
    context.moveTo(gridSize * i, 0);
    context.lineTo(gridSize * i, canvasHeight);
  }
  context.stroke();
  

  
  
});