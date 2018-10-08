const mongoose = require('mongoose');
const schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

var GameSchema = mongoose.Schema({
	games: schema.Types.Mixed
});

var Game = module.exports = mongoose.model('Games', GameSchema);

module.exports.saveGame = function(game, callback) {

	const _game = new Game({
        game: game
	});

    _game.save(callback);
}
