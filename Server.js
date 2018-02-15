var io = require('socket.io').listen(8008); 
var clients = {}; // array with users
var temp ={};
//io.set('log level', 1);
console.log((new Date()) + " Server is listening on port 8008");

io.sockets.on('connection', function (socket) {
	
	var ID = socket.id;
	var time = (new Date).toLocaleTimeString();
	console.log("New connection: " + ID + " | " + time); // New connection
	socket.emit("ping");
	
	socket.on('pong', function(data) {
	clients[data[0]] = data;
	clients[data[0]][2] = socket.id;
	io.sockets.emit("userlist",clients);// sending all the updated list of connected users
	});
	
	socket.on('prints', function(data) { // the transmission of information that the user types
		if(typeof clients[data[2]] !=="undefined") {
			var idsender = clients[data[2]][2]
			io.sockets.sockets[idsender].emit('prints',data[0],data[1],data[2]);	
		} else { socket.emit('eventmessage', 'The user is offline, you can not write it!'); } 
	});
	
	socket.on('publickey', function(data) { // request public key
		if(typeof clients[data[0]] !=="undefined") {
			var idsender = clients[data[0]][2]
			io.sockets.sockets[idsender].emit('publickey',data[1]);
		} else { socket.emit('eventmessage', 'Message transmission is impossible! The public key is not received!'); } // the user disconnects, the request is not transferred
	});
	
	socket.on('sendpublickey', function(data) { // transfer the public key
		if(typeof clients[data[0]] !=="undefined") {
			var idsender = clients[data[0]][2]
			io.sockets.sockets[idsender].emit('sendpublickey',data[0],data[1]);
		} else { socket.emit('eventmessage', 'The user disconnects, the transfer of the public key is impossible.'); } // there is no one to give your public key
	});
	
	socket.on('message', function(data) {
		//0: date and time, 1: recipient 2: sender 3: name of sender 4: text message 5: the public key 6:id message
		if (typeof clients[data[1]] !=="undefined"){
		var id = Math.random();
		var sidid = clients[data[1]][2]
		io.sockets.sockets[sidid].emit('message', data[0],data[1],data[2],data[3],data[4],data[5],id);
		socket.emit('eventmessage', 'The message sent to the user.'); //The message sent to the user
		} else { socket.emit('eventmessage', 'The message is not sent! The user disconnects!'); } // if the user is offline then write to the sender
	});
		
	// When the client disconnect - notify other
	socket.on('disconnect', function() {
		var time = (new Date).toLocaleTimeString();
		console.log("Closing connections: " + ID + " | " + time)
		 for(var key in clients) {
		 	var temp_delete = clients[key][2].indexOf(ID)
		 	if (temp_delete == 0) 
		 		{ 
		 			delete clients[key];
		 			socket.broadcast.emit("userlist",clients);
		 		} 
    	}
	});
});




