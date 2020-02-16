
if('serviceWorker' in navigator){
	console.log('about to register sw.js');
  navigator.serviceWorker.register('/sw.js')
    .then((registration) => {
      console.log('-> Registered the service worker successfuly')
      
    })
    .catch((err) => {
      console.log('-> Failed to register:', err)
    });
}
