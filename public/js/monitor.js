"use strict";

$(document).ready(function () {
    client.connect(url, username, password, topicP, topicS, noLocal, handleMessage, handleWebSocketError, logWebSocketMessage, onWebSocketConnected);
});

var redrawHouse = function (canvas, context) {
  var houseImage = new Image();
  houseImage.onload = function() {
    context.drawImage (houseImage, 0, 0);
    for (var i=0; i<lights.length; i++) {
      if (lights[i].state == 'off') {
        context.save();
        context.globalAlpha=0.5;
        context.fillRect(lights[i].x1, lights[i].y1, lights[i].x2, lights[i].y2);
        context.restore();
      }
    }
  };
  houseImage.src = 'img/house.png';
};

// WebSocket event handlers
var handleMessage = function (msg) {
  consoleLog ('msg received: ' + msg);
lights = msg;
  redrawHouse (canvas, context);
};

var handleWebSocketError = function (error) {
};

var logWebSocketMessage = function (cls, msg) {
};

var onWebSocketConnected = function () {
  initHome();
};

var sendMessage = function(msg){
    client.sendMessage(msg);
};
