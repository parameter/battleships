const game = require('./game');

exports.bomb = function(x, y, socketId) {

    if (isPlayersTurn(socketId) === false) { return false; }

    var opponent = game.findOpponent(socketId);
    var hit = false;

    console.log('bomb',opponent);

    for (var i = 0; i < opponent.ships.length; i++) {
        for (var j = 0; j < opponent.ships[i].length; j++) {
            if (opponent.ships[i][j].x == x && opponent.ships[i][j].y == y) {
                return 'hit';
            }
        }
    }
    return 'miss';
}

exports.addBombToGame = function(x, y, id, result, _game) {
    _game.bombs.push({
        x: x,
        y: y,
        player_id: id,
        result: result
    });
}

function isPlayersTurn(socketId) {
    var _game = game.findGame(socketId);
    return _game.turn === socketId;
}
