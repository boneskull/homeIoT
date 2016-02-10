"use strict";

// WebSocket connection info
var url = 'wss://sandbox.kaazing.net/amqp091';
var username = 'guest';
var password = 'guest';
var topicP = 'demo_exchange';
var topicS = 'demo_exchange';
var noLocal = true;
var client = UniversalClientDef('amqp');

var turnOnLight = function (location, canvas, context) {
  var result = lights.filter(function (obj) {
    return obj.location == location;
  });
  result[0].state = 'on';
  redrawHouse(canvas, context);
};

var turnOffLight = function (location) {
  var result = lights.filter(function (obj) {
    return obj.location == location;
  });
  result[0].state = 'off';
  redrawHouse(canvas, context);
};

var toggleLight = function (indx, canvas, context) {
  if (lights[indx].state==="on")
  {
    lights[indx].state="off";
    redrawHouse(canvas, context);
  }
  else
  {
    lights[indx].state="on";
    redrawHouse(canvas, context);
  }
};

var drawbackground = function (canvas, context){
  var houseImage = new Image();
  houseImage.onload = function () {
    context.drawImage (houseImage, 0, 0);
  };
  houseImage.src = 'img/house.jpg';
};

var lights =
[
  {
    location: 'living room',
    state: 'off',
    x1: 67,
    y1: 115,
    x2: (215 - 63),
    y2: (253 - 115)
  },
  {
    location: 'bedroom',
    state: 'off',
    x1: 220,
    y1: 115,
    x2: (357 - 215),
    y2: (253 - 115)
  },
  {
    location: 'bathroom',
    state: 'off',
    x1: 70,
    y1: 257,
    x2: (215 - 65),
    y2: (401 - 257)
  },
  {
    location: 'kitchen',
    state: 'off',
    x1: 220,
    y1: 257,
    x2: (356 - 218),
    y2: (401 - 257)
  }
];
