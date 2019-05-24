var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.getElementById('shared-moments')

function openCreatePostModal() {
  createPostArea.style.display = 'block';

  if (deferredPrompt) {
    deferredPrompt.prompt()

    deferredPrompt.userChoice.then(function (choiceResult) {
      console.log(choiceResult.outcome)

      if (choiceResult.outcome == 'dismissed') {
        console.log('User cancelled installation')
      }
      else {
        console.log('User added to home screen')
      }

    })

    deferredPrompt = null
  }

  // if('serviceWorker' in navigator){
  //   navigator.serviceWorker.getRegistrations()
  //   .then(function(registrations){
  //     for(var i = 0; i < registrations.length ; i++)
  //     {
  //       registrations[i].unregister()
  //     }
  //   })
  // }


}

function closeCreatePostModal() {
  createPostArea.style.display = 'none';
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

//Function used to save assets in cache on clicking a button
function onSaveButtonClicked(event) {
  console.log("CLICKED")

  if ('caches' in window) {
    caches.open('user-requested')
      .then(function (cache) {
        cache.add('https://httpbin.org/get')
        cache.add('/public/src/images/sf-boat.jpg')
      })
  }
}

function clearCards() {
  while (sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild)
  }
}

function createCard(data) {
  var cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  var cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = "url(" + data.image + ")";
  cardTitle.style.backgroundSize = 'cover';
  cardTitle.style.height = '180px';
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = data.title;
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = data.location;
  cardSupportingText.style.textAlign = 'center';
  // var cardSaveButton = document.createElement('button')
  // cardSaveButton.textContent = 'Save'
  // cardSaveButton.addEventListener('click',onSaveButtonClicked)
  // cardSupportingText.appendChild(cardSaveButton)
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

function updateUI(data) {
  clearCards()
  for (var i = 0; i < data.length; i++) {
    createCard(data[i])
  }
}

var url = "https://pwa-advanced.firebaseio.com/posts.json"
var networkDataRecieved = false

fetch(url)
  .then(function (res) {
    return res.json();
  })
  .then(function (data) {
    networkDataRecieved = true
    console.log("FROM WEB", data)
    var dataArray = []
    for (var key in data) {
      dataArray.push(data[key])
    }
    updateUI(dataArray)
  });

// fetch(url,{
//   method:'POST',
//   headers:{
//     'Content-Type':'application/json',
//     'Accept':'application/json' 
//   },
//   body:JSON.stringify({
//     message:'Some message'
//   })
// })
//   .then(function (res) {
//     return res.json();
//   })
//   .then(function (data) {
//     networkDataRecieved = true
//     console.log("FROM WEB", data)
//     clearCards()
//     createCard();
//   });


if ('caches' in window) {
  caches.match(url)
    .then(function (response) {
      if (response) {
        return response.json()
      }
    })
    .then(function (data) {
      console.log("FROM CACHE", data)
      if (!networkDataRecieved) {
        var dataArray = []
        for (var key in data) {
          dataArray.push(data[key])
        }
        updateUI(dataArray)
      }
    })
}

