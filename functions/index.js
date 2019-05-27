var functions = require('firebase-functions');
var admin = require('firebase-admin');
const cors = require('cors')({origin: true});

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

var serviceAccount = require("./pwagram-fb-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://pwa-advanced.firebaseio.com/'
});

exports.storePostData = functions.https.onRequest(function (request, response) {
  // response.set('Access-Control-Allow-Origin', '*');
  // response.set('Access-Control-Allow-Credentials', 'true'); // vital
 
  // if (request.method === 'OPTIONS') {
  //   // Send response to OPTIONS requests
  //   response.set('Access-Control-Allow-Methods', 'GET','POST');
  //   response.set('Access-Control-Allow-Headers', 'Content-Type');
  //   response.set('Access-Control-Max-Age', '3600');
  //   response.status(204).send('');
  // }

  cors(request, response, function () {
    admin.database().ref('posts').push({
      id: request.body.id,
      title: request.body.title,
      location: request.body.location,
      image: request.body.image
    })
      .then(function () {
        response.status(201).json({ message: 'Data stored', id: request.body.id });
      })
      .catch(function (err) {
        response.status(500).json({ error: err });
      });
  });
});
