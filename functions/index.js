// Import the Firebase SDK for Google Cloud Functions.
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
const userReference = 'user/';
const boardsReference = '/boards/';

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
