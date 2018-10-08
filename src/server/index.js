const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const fs = require('fs');
const _ = require('underscore');
const UserCollection = require('./models/user');

// AUTH 
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongo = require('mongodb');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const game = require('./game');
const bomb = require('./bomb');
const config = require('./config/config.json');
const skins = require('./skins');

const port = 8080;
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const jwtConfig = require('./auth/config.js').config;

app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({
	secret: jwtConfig.jwtSecret,
	resave: true,
	saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static('static'));

app.use(require("body-parser").json());

server.listen(port, () => console.log("Listning on port:", port));

const loginRoutes = require('./auth/login_routes');
app.use('/users', loginRoutes);

io.use((socket, next) => {

	if (socket.handshake.query && socket.handshake.query.token) {

    	jwt.verify(socket.handshake.query.token, jwtConfig.jwtSecret, (err, decoded) => {
    		if(err) return next(new Error('Authentication error'));
    		socket.decoded = decoded;
    		next();
    	});
	} else {
    	next(new Error('Authentication error'));
	}
}).on('connection', (socket) => {

    socket.on('newUser', data => {
    	var socketIdAndShipsPromise = game.setUserSocketIdAndShips(socket.id,data);
    	let nrOnlineUsers = game.onlineUsers();

    	Promise.all([socketIdAndShipsPromise,nrOnlineUsers]).then(data => {
	    	nrOnlineUsers.then(nr => {
	    		io.sockets.emit('online', {config:config, skins:skins.list, usersOnline:nr});
	    	});
		});
    });

    socket.on('joinGame',() => {
    	UserCollection.getUserBySocketId(socket.id).then(player => {
    		game.tryToStartGame(player).then(result => {
	        	if (result) {
		            var opponent = game.findOpponent(socket.id);
		            console.log('START GAME',player.username,opponent.username);
		            socket.emit('startGame', opponent.username, true);
		            socket.to(opponent.socketId).emit('startGame', player.username, false);
		        } else {
		        	game.setUserWaiting(player.username,socket.id);
		        }
	        });
    	});
    });

    socket.on('chatMessage', (message, userId) => {
        var opponent = game.findOpponent(socket.id);
        socket.to(opponent.id).emit('newChatMessage', message);
    });

    socket.on('bomb', (x, y) => {
        var result = bomb.bomb(x, y, socket.id);
        var this_game = game.findGame(socket.id);
        var opponent = game.findOpponent(socket.id);

        bomb.addBombToGame(x, y, socket.id, result, this_game);

        var doWeHaveAWinner = game.doWeHaveAWinner(opponent,this_game);
        if (doWeHaveAWinner) {
            game.endGame(this_game,socket.id);
            var winner = socket.id;
        } else {
            var winner = null;
        }
        if (result === 'miss') {
            game.changePlayerTurn(this_game);
        }
        socket.emit('bomb_result', {result:result,socketId:socket.id, game:this_game, x:x, y:y, winner: winner});
        socket.to(opponent.socketId).emit('bomb_result', {result:result,socketId:socket.id, game:this_game, x:x, y:y, winner: winner});
    });

    socket.on('disconnect', () => {
    	console.log('Disconnect');
        game.leaveGame(socket.id);
        game.removeUser(socket.id);
        game.onlineUsers().then((onlineUsers) => {
        	socket.broadcast.emit('userDisconnected', onlineUsers);
        });
    });
});
