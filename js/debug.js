
var map = null;
var squares = null;
$(function() {
  
  var canvas = document.getElementById("map");
  var context = canvas.getContext('2d');
  var gridSize = 12;
  var canvasWidth = 432;
  var canvasHeight = 432;
  
  var img = new Image();
  img.src = "image/minimap.png";

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