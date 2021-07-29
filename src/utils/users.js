const users = [];

const getUser = (id) => {
	return users.find((user)=> user.id === id );
}

const getUserInRoom = (roomname) => {
	return users.filter((user)=> user.roomname === roomname);
}

const addUser = ({ id, username, roomname }) => {
	username = username.trim().toLowerCase();
	roomname = roomname.trim().toLowerCase();

	if(!username || !roomname) {
		return {
			error: 'Username or room are required'
		}
	}

	const existingUser = users.find((user)=> {
		return user.roomname === roomname && user.username === username
	});

	if(existingUser) {
		return {
			error: 'Username is in use'
		}
	}

	const user = { id, roomname, username };
	users.push(user);
	return { user };
}

const removeUser = (id) => {
	const index = users.findIndex((user)=> user.id === id );
	if(index !== -1) {
		return users.splice(index, 1)[0]; 
	}
}

module.exports = {
	addUser,
	removeUser,
	getUserInRoom,
	getUser
}