
var gpio = require("pigpio").Gpio;
var ip = require("ip");
var espeak = require("espeak");
var soundplayer = require("sound-player");
var fs = require('fs');
var LCD = require('lcdi2c');
var prun = require('is-running');
var i2c = require('i2c-bus');

const pathPID = './PID.txt'

try{
  if (fs.existsSync(pathPID)) {
    console.log ('PID file exists.');
    console.log(`This process has pid ${process.pid}`);
    var contents = fs.readFileSync(pathPID, 'utf8');
    if (prun(contents)) {
      console.log('The application is already running. Closing this duplicate process.');
      process.exit(1);
    } else {
      console.log('The PID saved in file does not exist.');
      fs.writeFile(pathPID, process.pid, function(){console.log('PID file was updated with current PID: ' + process.pid)});
    }
  } else {
    console.log ('No PID file found. Creating and populating with PID ' + process.pid + '...');
    fs.writeFile(pathPID, process.pid, function(){console.log('done.')});
  }
} catch (err) {
  console.log (err);
}



var lcd = new LCD( 1, 0x3F, 16, 2); //(bus, address, columns, rows)
if (lcd.error) {
  console.log('LCD not connected properly or at all');
} else {
  lcd.clear();
  lcd.println( 'Welcome to TJBot', 1);
    if (lcd.error) {
      console.log( lcd.error );
    } else {
      lcd.println( 'Button gives IP.', 2);
    };
}


    

//setting up button on pin 13 + GND
const button = new gpio(13, {
  mode: gpio.INPUT,
  pullUpDown: gpio.PUD_UP,
  alert: true
});

/*
Level must be stable for 10 ms before an alert event is emitted - to filter out unwanted noise from an input signal
*/
button.glitchFilter(10000);

 /*
 Listening for alert event which will return a callback with two parameters - level wchich van be high or low and tick which is a timestamp of the alert
*/

button.on('alert', function(level, tick) {
  if (level == 0) {
    console.log("Button Pressed")
    var myIP = ip.address();
    if (myIP.toString() == '127.0.0.1'){
      myIP = 'not available';
    }
    var ipina = "My I P is.   " + myIP.toString();
    console.log("My IP address is: " + myIP);
    if (lcd.error) {
      console.log('LCD not connected properly or at all');
    } else {
      lcd.clear();
      lcd.println( 'IP Address:', 1);
      if (lcd.error) {
        console.log( lcd.error );
      } else {
        lcd.println( myIP, 2);
      };
    };
    
  

 //   var promisetoplay = new Promise (function(resolve,reject) {
    espeak.speak(ipina, ['-s 122'], function(err, wav) {
      if (err) return console.error(err);
     
      // get the raw binary wav data
      var buffer = wav.buffer;

      // save buffer to file mojeipina.wav
      let path = 'mojeipina.wav';
      fs.open(path, 'w', function(err,fd) {  
        if (err) {
          throw 'Could not open file: ' + err;
        }
      
        fs.write(fd, buffer, 0, buffer.length, null, function(err) {
          if (err) throw 'error writing file: ' + err;
          fs.close(fd, function() {
            console.log('Sound file created successfully.');
          });
        });
      });
      
      // configuration of the sound-player 
        var options = {
          filename: "mojeipina.wav",
          gain: 100,
          debug: true,
          player: "aplay",   
        }
      // play the file
        var myplayer = new soundplayer(options)
        myplayer.play();
      // on completion delete the sound file
        myplayer.on('complete', function(){
          console.log ("File was played.");
          if (lcd.error) {
            console.log('LCD not connected properly or at all');
          } else {
            lcd.clear();
            lcd.println( 'Welcome to TJBot', 1);
              if (lcd.error) {
                console.log( lcd.error );
              } else {
                lcd.println( 'Button gives IP.', 2);
              };
          };
        });

        myplayer.on('error', function(err) {
          console.log (err);
        })
            
      });
 
  }
});