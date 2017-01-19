'use strict';

function handle(mod, app, ws) {
	function _ws_sendmsg(msg) {
		const msg_json = JSON.stringify(msg);
		ws.send(msg_json);
	}
	ws.sendmsg = _ws_sendmsg;

	function _respond(request, err, response) {
		if (err) {
			response = {
				type: 'error',
				message: err.message,
			};
		}
		if (!response.type) {
			response.type = 'answer';
		}
		response.rid = request.rid;
		ws.sendmsg(response);
	}
	ws.respond = _respond;

	ws.on('message', function(msg_json) {
		try {
			const msg = JSON.parse(msg_json);
			if (!msg || !msg.type) {
				ws.sendmsg({
					type: 'error',
					message: 'invalid JSON or type missing',
				});
			}

			if (msg.type === 'error') {
				console.error('Received error message from client: ' + msg.message);
				return;
			}

			const func = mod['handle_' + msg.type];
			if (! func) {
				ws.sendmsg({
					type: 'error',
					message: 'Unsupported message type ' + msg.type,
					rid: msg.rid,
				});
				return;
			}

			func(app, ws, msg);
		} catch (e) {
			console.error('Error in message handler', e);
			return;
		}
	});
	ws.on('close', function() {
		mod.on_close(app, ws);
	});
}

module.exports = {
	handle,
};