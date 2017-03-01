'use strict';

function handle_keepalive(app, ws, msg) {
	// TODO
}

function handle_tournament_list(app, ws, msg) {
	app.db.tournaments.find({}, function(err, tournaments) {
		ws.respond(msg, err, {
			tournaments: tournaments,
		});
	});
}

function handle_tournament_get(app, ws, msg) {
	if (! msg.key) {
		return ws.respond(msg, {message: 'Missing key'});
	}

	app.db.tournaments.findOne({key: msg.key}, function(err, tournament) {
		if (!err && !tournament) {
			err = {message: 'No tournament ' + msg.key};
		}

		ws.respond(msg, err, {
			tournament: tournament,
		});
	});
}

function handle_create_tournament(app, ws, msg) {
	if (! msg.key) {
		return ws.respond(msg, {message: 'Missing key'});
	}

	const t = {
		key: msg.key,
	};

	app.db.tournaments.insert(t, function(err, inserted_t) {
		ws.respond(msg, err, inserted_t);
	});
}

function on_connect(app, ws) {
	// Ignore for now: nice to know that you're connected, but has no effect on system state
	// We could initialize state here though, by attaching it to ws
}

function on_close() {
	// Ignore: Does not matter when an admin disconnects
}


module.exports = {
	handle_create_tournament,
	handle_tournament_get,
	handle_tournament_list,
	on_close,
	on_connect,
};