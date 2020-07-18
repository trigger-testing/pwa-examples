// Generate image asset img elements
// if (document.location.protocol !== "file:") {
if (self.location.protocol !== "file:") {
	var assetNames = [
		'Authentic',
		'FontA',
		'FontB',
		'TubeLeft',
		'TubeMid',
		'TubeRight',
		'TubeSingle'
	];
	var scaleNames = [
		'Large',
		'Medium',
		'Small'
	];
	// Generating content based on the template
	var template = `\n        <img id='image-store-SCALE-ASSET' src='data/img/placeholder.png' data-src='data/img/SCALE/NixieASSET.png' alt='SCALE ASSET' style='STYLE' EXTRA >`;
	// var template = `<img id='image-store-STOREID' 
	// data-src='data/img/SLUG' 
	// alt='NAME' style='STYLE'>`;
	var content = '';
	for (var i = 0; i < scaleNames.length; i++) {
		for (var j = 0; j < assetNames.length; j++) {
			// let urlprot = (document.location.protocol === "file:" ? "" : "/pwa-examples/divergence-meter/");
			// return `${urlprot}data/img/${scale}/Nixie${name}.png`;
			var entry = template
				// .replace(/POS/g,(i+1))
				// .replace(/SLUG/g,`${scaleNames[i]}/Nixie${assetNames[j]}.png`)
				// .replace(/NAME/g,`${scaleNames[i]} ${assetNames[j]}`)
				// .replace(/STOREID/g,`${scaleNames[i]}-${assetNames[j]}`)
				.replace(/SCALE/g,scaleNames[i])
				.replace(/ASSET/g,assetNames[j])
				.replace(/STYLE/g,'display:inline;')
				.replace(/EXTRA/g,'width=\'1px\' height=\'1px\'')
				;
			//entry = entry.replace('<a href=\'http:///\'></a>','-');
			content += entry;
		}
	};
	document.getElementById('image-store').innerHTML = content;
}

// Registering Service Worker
if ('serviceWorker' in navigator) {
	// navigator.serviceWorker.register('/pwa-examples/divergence-meter/sw.js');
	navigator.serviceWorker.register('sw.js');
};

// Requesting permission for Notifications after clicking on the button
// var button = document.getElementById("notifications");
// button.addEventListener('click', function(e) {
// 	Notification.requestPermission().then(function(result) {
// 		if (result === 'granted') {
// 			randomNotification();
// 		}
// 	});
// });

// // Setting up random Notification
// function randomNotification() {
// 	var randomItem = Math.floor(Math.random()*games.length);
// 	var notifTitle = games[randomItem].name;
// 	var notifBody = 'Created by '+games[randomItem].author+'.';
// 	var notifImg = 'data/img/'+games[randomItem].slug+'.jpg';
// 	var options = {
// 		body: notifBody,
// 		icon: notifImg
// 	}
// 	var notif = new Notification(notifTitle, options);
// 	setTimeout(randomNotification, 30000);
// };

// Progressive loading images
var imagesToLoad = document.querySelectorAll('img[data-src]');
// console.log(imagesToLoad);
var loadImages = function(image) {
	let image2 = new Image();
	image2.src = image.getAttribute('data-src');
	image.setAttribute('src', image.getAttribute('data-src'));
	image.onload = function() {
		image.removeAttribute('data-src');
		// if (image.parentElement === document.getElementById("image-store")) {
		// 	image.style.visibility = 'hidden';
		// }
	};
};
// if ('IntersectionObserver' in window) {
// 	var observer = new IntersectionObserver(function(items, observer) {
// 		items.forEach(function(item) {
// 			if(item.isIntersecting) {
// 				loadImages(item.target);
// 				observer.unobserve(item.target);
// 			}
// 		});
// 	});
// 	imagesToLoad.forEach(function(img) {
// 		observer.observe(img);
// 	});
// }
// else {
	imagesToLoad.forEach(function(img) {
		loadImages(img);
	});
// }
