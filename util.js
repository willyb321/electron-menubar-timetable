const Config = require('electron-config');
const isRenderer = require('is-electron-renderer');
const {dialog} = isRenderer ? require('electron').remote : require('electron');
const conf = new Config();

function loadTimetable(reload) {
	let ttJSON;
	if (!conf.has('json.path') || reload) {
		const file = dialog.showOpenDialog({properties: ['openFile'], filters: [{extensions: ['json']}]});
		if (file) {
			try {
				ttJSON = require(file[0]);
			} catch (err) {
				console.log(err);
			} finally {
				if (ttJSON) {
					conf.set('json.path', file[0]);
					conf.set('json.json', ttJSON);
				}
			}
		}
	} else {
		try {
			if (conf.has('json.json')) {
				ttJSON = conf.get('json.json');
			} else {
				ttJSON = require(conf.get('json.path'));
			}
		} catch (err) {
			console.log(err);
			conf.clear();
			dialog.showMessageBox({type: 'error', buttons: [], title: 'Timetable failed to load.', message: 'Timetable failed to load. Exiting.'});
			app.quit();
		}
	}
	return ttJSON;
}

module.exports = loadTimetable;
