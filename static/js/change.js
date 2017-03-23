var change = (function() {

function default_handler(rerender, special_funcs) {
	return function(c) {
		default_handler_func(rerender, special_funcs, c);
	};
}

function change_score(cval) {
	const match_id = cval.match_id;

	// Find the match
	const m = utils.find(curt.matches, m => m._id === match_id);
	if (!m) {
		cerror.silent('Cannot find match to update score, ID: ' + JSON.stringify(match_id));
		return;
	}

	m.network_score = cval.network_score;
	m.presses = cval.presses;
	m.team1_won = cval.team1_won;
}

function change_current_match(cval) {
	// Do not use courts_by_id since that may not be initialized in all views
	const court = utils.find(curt.courts, c => c._id === cval.court_id);
	court.match_id = cval.match_id;
}

function default_handler_func(rerender, special_funcs, c) {
	if (special_funcs && special_funcs[c.ctype]) {
		special_funcs[c.ctype](c);
		return;
	}

	switch (c.ctype) {
	case 'props':
		curt.name = c.val.name;
		curt.btp_enabled = c.val.btp_enabled;
		curt.btp_ip = c.val.btp_ip;
		uiu.qsEach('.ct_name', function(el) {
			if (el.tagName.toUpperCase() === 'INPUT') {
				el.value = c.val.name;
			} else {
				uiu.text(el, c.val.name);
			}
		});
		uiu.qsEach('input[name="btp_enabled"]', function(el) {
			el.checked = curt.btp_enabled;
		});
		uiu.qsEach('input[name="btp_ip"]', function(el) {
			el.value = curt.btp_ip;
		});
		break;
	case 'match_add':
		curt.matches.push(c.val.match);
		rerender();
		break;
	case 'match_edit':
		{
		const changed_m = utils.find(curt.matches, m => m._id === c.val.match__id);
		if (changed_m) {
			changed_m.setup = c.val.setup;
		} else {
			cerror.silent('Cannot find edited match ' + c.val.match__id);
		}
		rerender();
		}
		break;
	case 'courts_changed':
		curt.courts = c.val.all_courts;
		rerender();
		break;
	case 'umpires_changed':
		curt.umpires = c.val.all_umpires;
		uiu.qsEach('select[name="umpire_name"]', function(select) {
			cmatch.render_umpire_options(select, select.value);
		});
		break;
	case 'score':
		change_score(c.val);
		// Most dialogs don't show any matches, so do not rerender
		break;
	case 'court_current_match':
		change_current_match(c.val);
		// Most dialogs don't show any matches, so do not rerender
		break;
	case 'btp_status':
		uiu.text_qs('.btp_status', 'BTP-Status: ' + c.val);
		break;
	default:
		cerror.silent('Unsupported change type ' + c.ctype);
	}
}

return {
	default_handler,
	change_current_match,
};

})();

/*@DEV*/
if ((typeof module !== 'undefined') && (typeof require !== 'undefined')) {
	var cerror = require('./cerror');
	var cmatch = require('./cmatch');
	var uiu = require('../bup/js/uiu');
	var utils = require('./utils');

    module.exports = change;
}
/*/@DEV*/
