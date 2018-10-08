var mongoose = require('mongoose');
const schema = mongoose.Schema;
var bcrypt = require('bcryptjs');

// User Schema
var UserSchema = mongoose.Schema({
	username: {
		type: String,
		index:true
	},
	status: {
		type: String
	},
	password: {
		type: String
	},
	socketId: String,
	ships: schema.Types.Mixed
});

// module.exports = mongoose.model('User', UserSchema);
var User = module.exports = mongoose.model('User', UserSchema);

module.exports.setUserWaiting = function(username,socketId) {
	return User.findOneAndUpdate({username:username,socketId:socketId},{status:'waiting'}).exec();
}

module.exports.setUserOnline = function(username) {
	return User.findOneAndUpdate({username:username},{status:'online'}).exec();
}

module.exports.createUser = function(newUser, callback) {
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(newUser.password, salt, function(err, hash) {
	        newUser.password = hash;
	        newUser.save(callback);
	    });
	});
}

module.exports.getUserByUsername = function(username, callback) {
	var query = {username: username};
	return User.findOne(query,callback);
}

module.exports.getUserBySocketId = function(socketId) {
    return new Promise((resolve, reject) => {
        User.findOne({socketId:socketId}, (err,user) => {
        	if (!err) {
        		resolve(user);
        	} else {
        		reject();
        	}
        });
    });
}

module.exports.getUserById = function(id, callback) {
	return User.findById(id, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback) {

	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    	if(err) throw err;
    	callback(null, isMatch);
	});
}

module.exports.nrWaiting = function(id) {
	return User.count({status: 'waiting'});
}

module.exports.getOnlineUsers = function() {
	return User.count({$or:[ {'status':'online'}, {'status':'waiting'} ]}).exec();
}
