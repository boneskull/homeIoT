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

var hasTouchEvents = 'ontouchstart' in document.createElement( 'div' );
var redlight = $('#redlight')[0];
var graybutton = $('#graybutton')[0];

graybutton.addEventListener( hasTouchEvents ? 'touchstart' : 'mousedown', function( e ) {
  recordSpeech();
  e.preventDefault();
}, false );

graybutton.addEventListener( hasTouchEvents ? 'touchend' : 'mouseup', function( e ) {
  redlight.src="img/redlightoff.png";
  setTimeout (function() {
    stream.stop();
  }, 1000);
  e.preventDefault();
}, false );

// WebSocket event handlers
var handleMessage = function (msg) {
  lights = msg;
  redrawHouse(canvas, context);
};

var handleWebSocketError = function (error) {
};

var logWebSocketMessage = function (cls, msg) {
};

var onWebSocketConnected = function () {
  initHome();
  sendMessage();
};

var sendMessage = function(){
  client.sendMessage(lights);
  for (var i=0; i<lights.length; i++) {
    (lights[i].state === 'on') ?
      sendHTTPRequest (lights[i].iftttEvent, 'On') :
      sendHTTPRequest (lights[i].iftttEvent, 'Off');
  }
};

var sendHTTPRequest = function (room, state) {
  var url = '/lights/'+room+'/'+state;
  $.ajax({
    type: "GET",
    url: url
  });
};

var processText = function(text) {

  var changeLights =
  [
    {
      location: lights[0].location,
      action: ''
    },
    {
      location: lights[1].location,
      action: ''
    },
    {
      location: lights[2].location,
      action: ''
    },
    {
      location: lights[3].location,
      action: ''
    }
  ];

  var everything =
  [
    ' all ',
    ' every ',
    ' everything '
  ]

  for (var i=0; i<lights.length; i++) {
    if (text.includes(lights[i].location)) {
      if (text.includes('on')) {
        var result = changeLights.filter(function (obj) {
          return obj.location === location;
        });
        result.action = 'on';
        lights[i].state = result.action;
      }
      else if (text.includes ('off')) {
        var result = changeLights.filter(function (obj) {
          return obj.location === location;
        });
        result.action = 'off';
        lights[i].state = result.action;
      }
    }
  }

  for (var i=0; i<everything.length; i++) {
    if (text.includes(everything[i])) {
      if (text.includes('on')) {
        for (var j=0; j<lights.length; j++) {
          lights[j].state='on';
        }
      }
      else if (text.includes('off')) {
        for (var j=0; j<lights.length; j++) {
          lights[j].state='off';
        }
      }
    }
  }
};

var stream;

var recordSpeech = function() {
  $.get('/token').then(function (token) {
    stream = WatsonSpeechToText.stream({
        token: token
    });
    redlight.src="img/redlighton.png";

    // each result (sentence) gets it's own <span> because Watson will sometimes go back and change a word as it hears more context
    // var $curSentence = $('<span>&nbsp;</span>').appendTo($output);
    var curSentence='';
    // a result is approximately equivalent to a sentence
    stream.on('result', function(result) {
        // update the text for the current sentence with the default alternative.
        // there may be multiple alternatives but this example app ignores all but the first.
        curSentence = result.alternatives[0].transcript;
        $('#watsonText').text(curSentence);
        if (result.final) {
          // if we have the final text for that sentence, start a new one
          processText(curSentence);
          redrawHouse(canvas, context);
          sendMessage();
          consoleLog ("Final sentence: " + curSentence);
        }
    });

    stream.on('error', function(err) {
        consoleLog(err);
    });

  });
};
