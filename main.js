const path = require('path');
const electron = require('electron');
const windowStateKeeper = require('electron-window-state');
// Module to control application life.

const {app} = electron;
// Module to create native browser window.
const {BrowserWindow} = electron;
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win = BrowserWindow; // BrowserWindow in which to show the dialog
const unhandled = require('electron-unhandled');

unhandled();
function createWindow() {
	const mainWindowState = windowStateKeeper({
		defaultWidth: 1280,
		defaultHeight: 720
	});

	// Create the window using the state information
	win = new BrowserWindow({
		x: mainWindowState.x,
		y: mainWindowState.y,
		width: mainWindowState.width,
		height: mainWindowState.height
	});

	// Let us register listeners on the window, so we can update the state
	// automatically (the listeners will be removed when the window is closed)
	// and restore the maximized or full screen state
	mainWindowState.manage(win);
	// Create the browser window.
	// And load the index.html of the app.
	win.loadURL(`file://${__dirname}/index.html`);
	// Open the DevTools.
	// win.webContents.openDevTools()
	// Emitted when the window is closed.
	win.on('closed', () => {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		win = null;
	});
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);
// Quit when all windows are closed.
app.on('window-all-closed', () => {
	// On OS X it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit();
	}
});
app.on('activate', () => {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (win === null) {
		createWindow();
	}
});
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
