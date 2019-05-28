var functions = require('firebase-functions');
var admin = require('firebase-admin');
var cors = require('cors')({origin: true});
var webpush = require('web-push')
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
        webpush.setVapidDetails('mailto:abc@gmail.com','BO0HM2j8REnu_HQ5xE9dWV42JXqlnvuKa-qeZAmc5pUtTgiHQcHiHvZ_VGpPHOVzf4jVAg5TEO_rHEcI6zq78_0','Kp5ybmalHK6eAlSRXtqcafsexrqpZwwMBnqZ7QLXgK4')
        return admin.database().ref('subscriptions').once('value')
      })
      .then(function(subscriptions){
        subscriptions.forEach(function(sub){
          var pushConfig = {
            endpoint:sub.val().endpoint,
            keys:{
              auth:sub.val().keys.auth,
              p256dh:sub.val().keys.p256dh
            }
          };
          webpush.sendNotification(pushConfig,JSON.stringify({
            title:'New Post',
            content:'New post added',
            openUrl:'/public/help/index.html'
          }))
          .catch(function(err){
            console.log(err)
          })
          response.status(201).json({ message: 'Data stored', id: request.body.id });
        })
      })
      .catch(function (err) {
        response.status(500).json({ error: err });
      });
  });
});
