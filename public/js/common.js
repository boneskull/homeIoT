"use strict";

var debug = false;

// WebSocket connection info
var url = 'wss://sandbox.kaazing.net/amqp091';
var username = 'guest';
var password = 'guest';
var topicP = 'demo_exchange';
var topicS = 'demo_exchange';
var noLocal = true;
var client = UniversalClientDef('amqp');

// HTML5 canvas
var canvas = $('#houseCanvas')[0];
canvas.width = 690;
canvas.height = 500;
var context = canvas.getContext("2d");
context.clearRect(0, 0, canvas.width, canvas.height);

var initHome = function() {
  redrawHouse(canvas, context);
};

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
    x1: 122,
    y1: 140,
    x2: (321-122),
    y2: (296-140),
    iftttEvent: 'LivingRoomSwitch'
  },
  {
    location: 'bedroom',
    state: 'off',
    x1: (321),
    y1: 140,
    x2: (492 - 321),
    y2: (296 - 140),
    iftttEvent: 'BedroomSwitch'
  },
  {
    location: 'bathroom',
    state: 'off',
    x1: 122,
    y1: 296,
    x2: (321 - 122),
    y2: (193),
    iftttEvent: 'BathroomSwitch'
  },
  {
    location: 'kitchen',
    state: 'off',
    x1: 321,
    y1: 296,
    x2: (492-321),
    y2: 193,
    iftttEvent: 'KitchenSwitch'
  }
];

var consoleLog = function (text) {
  if (debug) {
    console.log (text);
  }
};
