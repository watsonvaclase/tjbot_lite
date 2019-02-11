/*
* User-specific configuration
* IMPORTANT NOTES:
*   Please ensure you do not interchange your username and password.
*   Your username is the longer value: 36 digits, including hyphens
*   Your password is the smaller value: 12 characters
*/

exports.conversationWorkspaceId = ''; // replace with the workspace identifier of your conversation

// Create the credentials object for export
exports.credentials = {};

// Watson Assistant
// https://www.ibm.com/watson/ai-assistant/
exports.credentials.assistant = {
	password: '',
	username: ''
};

// Watson Speech to Text
//For older instances use password/usrername fields instead of iam_apikey
// https://www.ibm.com/watson/services/speech-to-text
exports.credentials.speech_to_text = {
	//password: '',
	//username: ''
	iam_apikey: '',
	url: ''
};

// Watson Text to Speech
//For older instances use password/usrername fields instead of iam_apikey
// https://www.ibm.com/watson/services/text-to-speech
exports.credentials.text_to_speech = {
	//password: '',
	//username: ''
	iam_apikey: '',
	url: ''
};

// Watson Visual Recognition
// https://www.ibm.com/watson/services/visual-recognition
exports.credentials.visual_recognition = {
	//api_key: '', //for older service instances created before May 23, 2018 
	iam_apikey: ''
};