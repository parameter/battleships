const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const mongoURL = 'mongodb://localhost:27017/';
const UserCollection = require('./models/user');
const GameCollection = require('./models/game');

const _ = require('underscore');
const shortId = require('shortid');

const OnlineUsers = [];
const Games = [];
const ArchivedGames = [];
var AwaitingGame = [];
const Cols = 10;
const Rows = 10;

exports.onlineUsers = function() {
    return UserCollection.getOnlineUsers();
}

exports.setUserWaiting = function(username,socketId) {
    UserCollection.setUserWaiting(username,socketId);
}

exports.doWeHaveAWinner = function(opponent,game) {

    var nrShipsDown = 0;
    
    _.each(opponent.ships, function(ship,i) {
        var shipDown = true;
        _.each(ship, function(square,ii) {
            if(typeof _.find(game.bombs, function(bomb) { return bomb.x === square.x && bomb.y === square.y && bomb.result === 'hit'; }) === 'undefined') {
                shipDown = false;
            }
        });
        if (shipDown === true) {
            nrShipsDown++;
        }
    });

    return nrShipsDown === opponent.ships.length;
}

exports.setUserSocketIdAndShips = function(socketId,data) {
    return new Promise((resolve, reject) => {
        UserCollection.findOneAndUpdate({username:data.username},{socketId:socketId,ships:data.ships}, (err) => {
            if (!err) {
                resolve(true);
            } else {
                reject();
            }
        });
    });
}

exports.tryToStartGame = function(player) {
    return new Promise((resolve, reject) => {
        let opponentPromise = UserCollection.findOne({'status': 'waiting'}).limit(1).exec();
        opponentPromise.then(opponent => {
            if (opponent) {
                Games.push({
                    id: shortId.generate(),
                    player_1: player,
                    player_2: opponent,
                    turn: player.socketId,
                    bombs: [],
                    status:'active',
                    winner: null
                });
                resolve(true);
            } else {
                resolve(false);
            }
        });
    });
}

exports.endGame = function(game,winner_socketId) {
    game.status = 'over';
    game.winner = winner_socketId;
    for (var i = 0; i < Games.length; i++) {
        if (Games[i].id === game.id) {
            Games.splice(i, 1);
            break;
        }
    }
    archiveGame(game);
}

archiveGame = function(game) {
    GameCollection.saveGame(game);
}

findUser = function(id) {
    for (var i = 0; i < OnlineUsers.length; i++) {
        if (OnlineUsers[i].id === id) {
            return OnlineUsers[i];
        }
    }
}

exports.findGame = function(socketId) {
    for (var i = 0; i < Games.length; i++) {
        if (Games[i].player_1.socketId === socketId || Games[i].player_2.socketId === socketId) {
            return Games[i];
        }
    }
}

exports.changePlayerTurn = function(game) {
    if (game.turn === game.player_1.socketId) {
        game.turn = game.player_2.socketId;
    } else {
        game.turn = game.player_1.socketId;
    }
}

exports.findOpponent = function(socketId) {
    for (var i = 0; i < Games.length; i++) {
        if (Games[i].player_1.socketId === socketId) {
            return Games[i].player_2;
        }
        if (Games[i].player_2.socketId === socketId) {
            return Games[i].player_1;
        }
    }
}

exports.findPlayer = function(id) {
    for (var i = 0; i < Games.length; i++) {
        if (Games[i].player_1.socketId === socketId) {
            return Games[i].player_1;
        }
        if (Games[i].player_2.socketId === socketId) {
            return Games[i].player_2;
        }
    }
}

exports.leaveGame = function(player) {
    for (var i = 0; i < Games.length; i++) {
        if (Games[i].player_1 === player || Games[i].player_2 === player) {
            Games.splice(i, 1);
        }
    }
}

exports.removeUser = function(socketId) {
    return new Promise((resolve, reject) => {
        UserCollection.findOneAndUpdate({socketId:socketId},{status:'offline'},(err) => {
            if (!err) {
                resolve();
            } else {
                reject();
            }
        });
    });
}
