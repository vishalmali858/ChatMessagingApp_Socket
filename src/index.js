const express = require('express');
const path = require('path');
const app = express();
const http = require("http");
const websocket = require("socket.io");
const Filter = require("bad-words");
const { generateMessage, generateLocationMessage } = require("./utils/messages.js");
const { addUser, removeUser, getUserInRoom, getUser } = require("./utils/users.js");

const server = http.createServer(app);
const io = websocket(server);

const port = process.env.PORT || 3000;
let publicDirectoryPath =  path.join(__dirname, "../public");
app.use(express.static(publicDirectoryPath));

let _count = 0;
io.on("connection", (socket)=>{
	socket.on("send_message", (message, callback) => {
		let userFetched = getUser(socket.id);
		if(!userFetched) {
			return callback("User Not Found");
		}
		const filter = new Filter(); 
		if(filter.isProfane(message)) {
			return callback("Profinify is not allowed");
		}
		io.to(userFetched.roomname).emit('message', generateMessage(message, userFetched.username));
		return callback();
	});

	socket.on("send_location", (message, callback) => {
		let userFetched = getUser(socket.id);
		if(!userFetched) {
			return callback("User Not Found");
		}
		io.to(userFetched.roomname).emit('locationMessage', generateLocationMessage("https://google.com/maps?q=" + message.longitude + "," + message.latitude, userFetched.username));
		callback();
	});

	socket.on("join", ({ username, roomname }, callback) => {
		const { error, user } = addUser({ id: socket.id, username, roomname });
		if(error) {
			return callback(error);
		}

		socket.join(user.roomname);
		socket.emit('message', generateMessage("Welcome! ", "Admin"));
		socket.broadcast.to(user.roomname).emit('message', generateMessage(user.username + " has joined the room " + user.roomname, 'Admin'));
		io.to(user.roomname).emit('roomData', {
			roomname: user.roomname,
			users: getUserInRoom(user.roomname)
		});
		callback();
	});

	socket.on("disconnect", ()=> {
		let userRemoved = removeUser(socket.id);
		if(userRemoved) {
			io.to(userRemoved.roomname).emit('message', generateMessage(userRemoved.username + ' left ' + userRemoved.roomname, 'Admin'));
			io.to(userRemoved.roomname).emit('roomData', {
			roomname: userRemoved.roomname,
			users: getUserInRoom(userRemoved.roomname)
			});
		}
});
})
// app.listen(port, ()=> {
// 	console.log("Server running");
// });

server.listen(port, ()=> {
	console.log("Server running");
});