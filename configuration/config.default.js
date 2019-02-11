//Default configuration of TJBot CZ
//!!!be careful with the configration of speakerDeviceId!!!
exports.tjConfig = {
	log: {
        level: 'info' // valid levels are 'error', 'warn', 'info', 'verbose', 'debug', 'silly'
    },
    robot: {
        gender: 'male', // ['male', 'female']
        name: 'Michael'
    },
    listen: {
        microphoneDeviceId: "plughw:1,0", // plugged-in USB card 1, device 0; see `arecord -l` for a list of recording devices
        inactivityTimeout: -1, // -1 to never timeout or break the connection. Set this to a value in seconds e.g 120 to end connection after 120 seconds of silence
        language: 'en-US', // see TJBot.prototype.languages.listen
        customization_id: '' //customization model id for STT
    },
    wave: {
        servoPin: 7 // corresponds to BCM 7 / physical PIN 26
    },
    speak: {
        language: 'en-US', // see TJBot.prototype.languages.speak
        voice: undefined, // use a specific voice; if undefined, a voice is chosen based on robot.gender and speak.language
                          // english voices: en-US_MichaelVoice, en-US_AllisonVoice, en-US_LisaVoice, en-GB_KateVoice
        speakerDeviceId: "plughw:0,0" // plugged-in USB card 1, device 0; `see aplay -l` for a list of playback devices
        //speakerDeviceId: "bluealsa:HCI=hci0,DEV=XX:XX:XX:XX:XX:XX,PROFILE=a2dp" // bluetooth speaker, set mac adress from "cat ~/.asoundrc" device
	
    },
    see: {
        confidenceThreshold: {
            object: 0.5,
            text: 0.1
        },
        camera: {
            height: 720,
            width: 960,
            verticalFlip: false, // flips the image vertically, may need to set to 'true' if the camera is installed upside-down
            horizontalFlip: false // flips the image horizontally, should not need to be overridden
        },
        language: 'en',
        classifier_ids: ["default"] // specify your custom built classifier here or use prebuilt onces which are as follows: 
                           // - "default": Returns classes from thousands of general tags.
                           // - "food": Enhances specificity and accuracy for images of food items.
                           // - "explicit": Evaluates whether the image might be pornographic.     
                            
    }
}

//tjbotcz RGB LED pins 
exports.ledpins = {
    R : 17,
    G : 27,
    B : 22
}

//tjbotcz enhancement
exports.paths = {
	picture: {
		orig: __dirname + '/../public/img/picture.jpg'
	},
	music: {
		take_a_picture: __dirname + '/../media/music/take_a_picture.mp3'
	}
}
