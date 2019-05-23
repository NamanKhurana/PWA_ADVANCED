let deferredPrompt

if(!window.Promise)
{
    window.Promise = Promise
}

if ('serviceWorker' in navigator)
{
    navigator.serviceWorker
    .register('./sw.js')
    .then(function(){
        console.log("Service worker registered successfully")
    })
    .catch(function(err){
        console.log(err)
    })
}

window.addEventListener('beforeinstallprompt',function(event){

    console.log("beforeinstallprompt Fired")
    event.preventDefault()
    deferredPrompt = event
    return false

})

