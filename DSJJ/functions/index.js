const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.onImageUpload = functions.storage.object().onFinalize(e => {
    if(e.name.startsWith("profile_pictures/")) {
        // get the name of the participant
        
        // create the QR code with the link
        // open card image
        // add the profile picture, the name and the QR to the card
        // Save the card in the cards dir and send it in the mail
    }
    return "ok";
})
