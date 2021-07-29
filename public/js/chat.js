const socket = io();

// let incrementButton = document.querySelector("#incrementButton");
// incrementButton.addEventListener("click", function() {
// 	console.log("clicked ");
// 	socket.emit('incrementCounter');
// })
// socket.on("countUpdated", (count)=> {
// 	console.log("Count Updated", count);
// })
let messages = document.querySelector("#messages");
let messagesTemplate = document.querySelector("#message-template").innerHTML;
let locationmessagesTemplate = document.querySelector("#location-message-template").innerHTML;

let searchButton = document.querySelector("#searchFormButton");
let messageSendInput = searchButton.querySelector("input");
let messageSendButton = searchButton.querySelector("button");

let sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

const autoScrollUp = () => {
	const $newMessageElement = messages.lastElementChild;
	const newMessageStyle = getComputedStyle($newMessageElement);
	const newMessageMargin = parseInt(newMessageStyle.marginBottom);

	const newMessageHeight = $newMessageElement.offsetHeight + newMessageMargin;

	const visibleHeight = messages.offsetHeight;

	const containerHeight = messages.scrollHeight;

	let scrollOffset = messages.scrollTop + visibleHeight;

	if(containerHeight - newMessageHeight <= scrollOffset) {
		messages.scrollTop = containerHeight;
	}
}

const { username, roomname } = Qs.parse(location.search, { ignoreQueryPrefix: true });

searchButton.addEventListener("submit", function(event) {
	let inputAdded = event.target.querySelector("input").value;
	event.preventDefault();
	if(inputAdded === '') {
		return
	}
	messageSendButton.setAttribute("disabled", "disabled");
	socket.emit('send_message', inputAdded, (error)=> {
		messageSendButton.removeAttribute("disabled");
		messageSendInput.value = '';
		messageSendInput.focus();
		if(error) {
			console.log("Profinality is not alloewd");
		} else {
			console.log("Message Shared");
		}
	});
})

let locationButton = document.querySelector("#locationButton");
locationButton.addEventListener("click", function(event) {
	event.preventDefault();
	locationButton.setAttribute("disabled", "disabled");
	if(!(navigator && navigator.geolocation)) {
		return alert("Geo location is not supported !");
	} else {
		navigator.geolocation.getCurrentPosition((position) => {
			socket.emit('send_location', { latitude: position.coords.latitude, longitude: position.coords.longitude}, ()=> {
				locationButton.removeAttribute("disabled");
				console.log("Location Shared !!");
			});
		});
	}
})


socket.on("message", (messagePrinted)=> {
	const html = Mustache.render(messagesTemplate, { message: messagePrinted.text, createdAt: moment(messagePrinted.createdAt).format('h:mm a'), userid: messagePrinted.username});
	messages.insertAdjacentHTML('beforeend', html);
	autoScrollUp();
})

socket.on("locationMessage", (locationPrinted)=> {
	const html = Mustache.render(locationmessagesTemplate, { location: locationPrinted.url, createdAt: moment(locationPrinted.createdAt).format('h:mm a'), userid: locationPrinted.username});
	messages.insertAdjacentHTML('beforeend', html);
	autoScrollUp();
})

socket.emit("join", { username, roomname }, (error)=> {
	if(error) {
		alert(error);
		location.href = '/';
	}
});

socket.on("roomData", ({ users, roomname }) => {
	const html = Mustache.render(sidebarTemplate, { users, room: roomname });
	document.querySelector("#chat_sidebar").innerHTML = html;
})