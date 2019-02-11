//TJBot libs
var TJBot = require("tjbotczlib");
var conf = require("./configuration/config"); //tjConfig & local czech enhancements
var confCred = require("./configuration/credentials"); //credentials only
var fs = require("fs"); //filesystem

//Pigpio library for LED (simple version)
var gpio = require("pigpio").Gpio;
const _basic_colors = ["red", "green", "blue", "yellow", "magenta", "cyan", "white"];

var pinR = new gpio(conf.ledpins.R, { mode: gpio.OUTPUT });
var pinG = new gpio(conf.ledpins.G, { mode: gpio.OUTPUT });
var pinB = new gpio(conf.ledpins.B, { mode: gpio.OUTPUT });
var _RGBLed = { pinR, pinG, pinB };

//TJBot - Watson services
//---------------------------------------------------------------------
var credentials = confCred.credentials;
var hardware = ['microphone', 'speaker', 'servo', 'camera', 'rgb_led']; 
var tjConfig = conf.tjConfig;
var _paths = conf.paths;

var tj = new TJBot(hardware, tjConfig, credentials);

//Context object
var contextBackup; // last conversation context backup
var ctx = {}; // our internal context object

//---------------------------------------------------------------------
// Functions
//---------------------------------------------------------------------

//VISUAL RECOGNITION
//---------------------------------------------------------------------

/**
 * TAKE A FOTO
 */
function take_a_photo() {
  return new Promise(function (resolve, reject) {
    tj.takePhoto(_paths.picture.orig).then(function (data) {
      if (!fs.existsSync(_paths.picture.orig)) {
        reject("expected picture.jpg to have been created");
      } else {
        resolve("picture taken successfully");
      }
    });
    tj.play(_paths.music.take_a_picture);
  });
}

/**
 * CLASSIFY PHOTO
 */
function classify_photo() {
  tj.recognizeObjectsInPhoto(_paths.picture.orig).then(function (objects) {
    console.log(JSON.stringify(objects, null, 2));

    photoClassificationToText(objects, function (text) {
      tj.speak(text);
    });
  });
}

/**
 * helper for classify_photo() which returns only objects in picture with score > 0.5 and max 5 classes
 * @param objects - list of objects
 */
function photoClassificationToText(objects, callback) {
  var text = "";
  var numOfClasses = 0;
  var maxNumOfClasses = 5;
  objects.sort(function (a, b) { return b.score - a.score; });
  for (var j = 0; j < objects.length; j++) {
    if (objects[j].score >= 0.5) {
      if (numOfClasses) text = text + ',';
      text = text + " " + objects[j].class;
      numOfClasses++;
      if (numOfClasses >= maxNumOfClasses) break;
    }

  }
  if (text != "") {
    text = "I think I can see: " + text + ".";
  } else {
    text = "I can't recognize what is in the picture.";
  }
  callback(text);
}

//CONVERSATION
//---------------------------------------------------------------------

/**
 * LISTEN
 */
function listen() {
  tj.speak("Hello, my name is " + tj.configuration.robot.name + ". I am listening...");

  tj.listen(function (msg) {
    // check to see if they are talking to TJBot
    if (msg.indexOf(tj.configuration.robot.name) > -1) { //robot's name is in the text
      // remove our name from the message
      var msgNoName = msg.toLowerCase().replace(tj.configuration.robot.name.toLowerCase(), "");

      processConversation(msgNoName, function (response) {
        //read response text from the service
        if (response.description) {
          tj.speak(response.description).then(function () {
            if (response.object.context.hasOwnProperty('action')) {
              var cmdType = response.object.context.action.cmdType;
              var cmdPayload;
              if (response.object.context.action.hasOwnProperty('cmdPayload')) {
                cmdPayload = response.object.context.action.cmdPayload;
              }
              processAction(cmdType, cmdPayload);
            }
          });
        }
      });
    }
  });
}

/**
 * Stop listening
 */
function stopListening() {
  tj.stopListening();

  var msg = "Listening was stopped.";
  tj.speak(msg);
  console.log(msg);
}

/**
 * PROCESS CONVERSATION
 * @param inTextMessage - text
 */
function processConversation(inTextMessage, callback) {
  if(contextBackup == null) contextBackup = ctx;
  if(contextBackup.hasOwnProperty('action')) delete contextBackup.action;
  if(contextBackup.hasOwnProperty('yes_photo')) delete contextBackup.yes_photo;
  // Object.assign(contextBackup, ctx);

  // send to the conversation service
  tj.converse(confCred.conversationWorkspaceId, inTextMessage, contextBackup, function (response) {
    console.log(JSON.stringify(response, null, 2));
    contextBackup = response.object.context;
    callback(response);
  });
}


//PROCESS ACTIONS
//---------------------------------------------------------------------
function processAction(cmd, payload) {
  switch (cmd) {
    case "tjbot_reset":
      resetTJBot();
      break;
    case "take_a_photo":
      take_a_photo().then(function () {
        tj.speak("I am done. You can classify objects now.");
      });
      break;
    case "classify_photo":
      classify_photo();
      break;
    case "read_text":
      //read_text();
      tj.speak("Unfortunately, the text recognition is not supported. You can classify objects now.");
      break;
    case "listen":
      listen();
      break;
    case "stop_listening":
      stopListening();
      break;
    case "led_turn_on":
      led_turn_on_all();
      break;
    case "led_turn_off":
      led_turn_off_all();
      break;
    case "led_change_color":
      led_change_color(payload.color);
      break;
    case "wave_arm":
      wave_arm(payload.position);
      break;
    default:
      console.log("Command not supported... " + cmd);
  }
}


//LED
//---------------------------------------------------------------------

//Turns off all the LED colors
//---------------------------------------------------------------------
function led_turn_off_all() {
  tj.turnOffRGBLed();
}

//Turns on all the LED on random color
//---------------------------------------------------------------------
function led_turn_on_all() {
  tj.turnOnRGBLed(function(ret_color){
    if(ret_color){
      console.log("Color is: " + ret_color);
    } else{
      console.log("LED did not turn on.");
    }
  });
}

//Changes the color of th RGB diode
//---------------------------------------------------------------------
function led_change_color(color){
  tj.changeColorRGBLed(color, function(ret_color){
    if(ret_color) {
      console.log("Color is: " + ret_color);
    } else {
      console.log("Color did not set.");
    }
  });
}

//ARM
//---------------------------------------------------------------------
function wave_arm(position) {
  switch (position) {
    case "back":
      tj.armBack();
      break;
    case "raised":
      tj.raiseArm();
      break;
    case "forward":
      tj.lowerArm();
      break;
    case "wave":
      tj.wave();
      break;
    default:
      tj.speak("I'm not able to set my arm into this position.");
  }
}


//RESET TJBOT
//---------------------------------------------------------------------
function resetTJBot() {
  tj.raiseArm();
  led_turn_off_all();
  tj.stopListening();
  listen();
}


//CALL INIT
//---------------------------------------------------------------------
resetTJBot();
