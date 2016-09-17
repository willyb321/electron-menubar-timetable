// requires be here
var path;
let remote = require('electron').remote;

let dialog = remote.require('electron').dialog;
let image = document.getElementById('imgTT'); // eslint-disable-line no-undef
const Config = require('electron-config');

const conf = new Config();
if (conf.get('imgPath') === undefined) {
	path = dialog.showOpenDialog({
		properties: ['openFile', 'multiSelections']
	});
}
conf.set('imgPath', path);

function changeImg() { // find the image, and then change the src to the path.
	if (image.src.match(conf.get('imgPath')[0])) {
		image.src = conf.get('imgPath')[1];
		console.log('Swapped to image 1');
	} else {
		image.src = conf.get('imgPath')[0];
		console.log('Swapped to image 2');
	}
}

function clearConf() { // eslint-disable-line no-unused-vars
	conf.delete('imgPath');
	var path = dialog.showOpenDialog({
		properties: ['openFile', 'multiSelections']
	});
	conf.set('imgPath', path);
	changeImg();
}
console.log(conf.get('imgPath'));
changeImg();
