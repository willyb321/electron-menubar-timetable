// requires be here
// const remote = require('electron').remote;
const unhandled = require('electron-unhandled');

unhandled();
const {dialog, app} = require('electron').remote

const Config = require('electron-config');

const conf = new Config();
console.log(Timetable)
let ttJSON;
const moment = require('moment');
if (!conf.has('json.path')) {
	const file = dialog.showOpenDialog({properties: ['openFile'], filters: [{extensions: ['json']}]});
	if (file) {
		try {
			ttJSON = require(file[0]);
		} catch (err) {
			console.log(err);
		} finally {
			if (ttJSON) {
				conf.set('json.path', file[0]);
			}
		}
	}
} else {
	try {
		ttJSON = require(conf.get('json.path'))
	} catch (err) {
		console.log(err);
		conf.clear();
		dialog.showMessageBox({type: 'error', buttons: [], title: 'Timetable failed to load.', message: 'Timetable failed to load. Exiting.'});
		app.quit();
	}
}

if (!ttJSON) {
	dialog.showMessageBox({type: 'error', buttons: [], title: 'Timetable failed to load.', message: 'Timetable failed to load. Exiting.'});
	app.quit();
}
for (const week in ttJSON) {
	for (const day in ttJSON[week]) {
		const timetable = new Timetable();
		const rooms = [];
		for (let period of ttJSON[week][day]) {
			try {
				timetable.addLocations([period.room])
			} catch (err) {
				if (err.message !== 'Location already exists') {
					console.log(err);
				}
			}
			const startDate = moment({hour: period.startTime.split(':')[0], minute: period.startTime.split(':')[1]}).day(day).toDate();
			const endDate = moment({hour: period.endTime.split(':')[0], minute: period.endTime.split(':')[1]}).day(day).toDate();
			if (startDate && endDate) {
				timetable.addEvent(period.name || 'Class', period.room || 'A Place', startDate, endDate);
			}
		}
		const renderer = new Timetable.Renderer(timetable);
		const elem = document.createElement('div')
		elem.className = `timetable`;
		elem.id = `timetable-${day}`;
		document.body.appendChild(elem);
		renderer.draw('#timetable-' + day); // any css selector

	}
}
