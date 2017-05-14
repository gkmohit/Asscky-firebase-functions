// Import the Firebase SDK for Google Cloud Functions.
const functions = require('firebase-functions');
const Filter = require('bad-words');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

const userReference = 'user/';
const boardsReference = '/boards/';
const badWordsFilter = new Filter();

/**
* Function to write asscky board under users if they just signed up.
*
*/
exports.addAssckyOnSignUp = functions.auth.user().onCreate(event => {
   // ...
   const user = event.data;
   const uid = user.uid;

   var asscky = {
      board_number : "asscky",
      description : "Welcome to asscky, you place to share your questions and opinions.",
      owner : "contactiwadevs@gmail.com",
      title : "Asscky Board"
   }

   return admin.database().ref( userReference + uid + boardsReference ).update({
      "asscky" : asscky
   });
});

/*
* Function to sanatize texts written to the database
*
*/
exports.sanitizeMessages = functions.database
.ref('/boards/{boardNum}/messages/{messageId}').onWrite( event => {
   const message = event.data.val();
   console.log(message);
   if (message && !message.sanitized) {
      // Retrieved the message values.
      console.log('Retrieved message content: ', message);

      // Run moderation checks on on the message and moderate if needed.
      const moderatedMessage = moderateMessage(message.message);

      // Update the Firebase DB with checked message.
      console.log('Message has been moderated. Saving to DB: ', moderatedMessage);
      return event.data.adminRef.update({
         message: moderatedMessage,
         sanitized: true,
         originalMessage: message.message,
         moderated: message.text !== moderatedMessage
      });
   }
});


// Moderates the given message if appropriate.
function moderateMessage(message) {
   // Re-capitalize if the user is Shouting.
   if (isShouting(message)) {
      console.log('User is shouting. Fixing sentence case...');
      message = stopShouting(message);
   }

   // Moderate if the user uses SwearWords.
   if (containsSwearwords(message)) {
      console.log('User is swearing. moderating...');
      message = moderateSwearwords(message);
   }

   return message;
}

// Returns true if the string contains swearwords.
function containsSwearwords(message) {
   return message !== badWordsFilter.clean(message);
}

// Hide all swearwords. e.g: Crap => ****.
function moderateSwearwords(message) {
   return badWordsFilter.clean(message);
}

// Detect if the current message is shouting. i.e. there are too many Uppercase
// characters or exclamation points.
function isShouting(message) {
   return message.replace(/[^A-Z]/g, '').length > message.length / 2 || message.replace(/[^!]/g, '').length >= 3;
}

// Correctly capitalize the string as a sentence (e.g. uppercase after dots)
// and remove exclamation points.
function stopShouting(message) {
   return capitalizeSentence(message.toLowerCase()).replace(/!+/g, '.');
}
