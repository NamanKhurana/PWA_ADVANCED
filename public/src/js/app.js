var enableNotificationButtons = document.querySelectorAll('.enable-notifications')
var deferredPrompt;

if (!window.Promise) {
  window.Promise = Promise;
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/public/sw.js')
    .then(function () {
      console.log('Service worker registered!');
    })
    .catch(function (err) {
      console.log(err);
    });
}

window.addEventListener('beforeinstallprompt', function (event) {
  console.log('beforeinstallprompt fired');
  event.preventDefault();
  deferredPrompt = event;
  return false;
});

function displayConfirmNotification(){

  if('serviceWorker' in navigator){

    var options = {
      body:'You successfully subscribed to our notification service',
      icon:'../images/icons/app-icon-96x96.png',
      image:'../images/sf-boat.jpg',
      dir:'ltr',
      lang:'en-US',
      vibrate:[100,50,200],
      badge:'../images/icons/app-icon-96x96.png',
      tag:'confirm-notification',
      renotify:'true',
      actions:[
        {action:'confirm',title:'Okay',icon:'../images/icons/app-icon-96x96.png'},
        {action:'cancel',title:'Cancel',icon:'../images/icons/app-icon-96x96.png'}
      ]
    }

    navigator.serviceWorker.ready
    .then(function(swreg){
    swreg.showNotification('Successfully Subscribed (from SW)',options)
    })
  }

}

function askForNotificationPermission() {
  Notification.requestPermission(function (result) {
    console.log("User choice", result)
    if (result !== 'granted') {
      console.log('No Notificaion permission granted')
    } else {
        displayConfirmNotification()
    }
  })
}

if ('Notification' in window) {
  for (var i = 0; i < enableNotificationButtons.length; i++) {
    enableNotificationButtons[i].style.display = 'inline-block'
    enableNotificationButtons[i].addEventListener('click', askForNotificationPermission)
  }
}
