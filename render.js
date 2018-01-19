// Requires be here
// const remote = require('electron').remote;
const unhandled = require('electron-unhandled');
const Ajv = require('ajv');

const ajv = new Ajv();
const schema = require('./timetable.schema.json');

unhandled();
const {dialog, app} = require('electron').remote;

const Config = require('electron-config');

const conf = new Config();
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

if (!ttJSON) {
	dialog.showMessageBox({type: 'error', buttons: [], title: 'Timetable failed to load.', message: 'Timetable failed to load. Exiting.'});
	app.quit();
}
const valid = ajv.validate(schema, ttJSON);
if (!valid) {
	console.log(ajv.errors);
	dialog.showMessageBox({type: 'error', buttons: [], title: 'Timetable failed to load.', message: 'Timetable failed to validate. Errors are printed.'});
	for (const i of ajv.errors) {

		document.querySelector('#validerr').innerHTML += `${i.dataPath}: ${i.message}\n`;
	}
	conf.delete('json.json');
}

const numToDayMap = {
	0: 'Sunday',
	1: 'Monday',
	2: 'Tuesday',
	3: 'Wednesday',
	4: 'Thursday',
	5: 'Friday',
	6: 'Saturday'
};

const timetable = new Timetable();
for (const week in ttJSON) {
	for (const day in ttJSON[week]) {
		const rooms = [];
		processPeriods(week, day, timetable);
		const elem = document.createElement('div');
		elem.className = `timetable`;
		elem.id = `timetable`;
		document.body.appendChild(elem);
	}
	const renderer = new Timetable.Renderer(timetable);
	renderer.draw('#timetable'); // Any css selector

}

function clearTimeTable() {
	conf.clear();
	dialog.showMessageBox({type: 'info', buttons: [], title: 'Config cleared.', message: 'Config cleared. Exiting. Re open and you will be prompted to check your timetable.'});
	app.quit();
}

function processPeriods(week, day, timetable) {
	for (const period of ttJSON[week][day]) {
		try {
			timetable.addLocations([`${period.room} (${numToDayMap[period.day]})`]);
		} catch (err) {
			if (err.message !== 'Location already exists') {
				console.log(err);
			}
		}
		const startDate = moment({hour: period.startTime.split(':')[0], minute: period.startTime.split(':')[1]}).day(day).toDate();
		const endDate = moment({hour: period.endTime.split(':')[0], minute: period.endTime.split(':')[1]}).day(day).toDate();
		if (startDate && endDate) {
			timetable.addEvent(period.name || 'Class', `${period.room} (${numToDayMap[period.day]})` || 'A Place', startDate, endDate);
		}
	}
}
