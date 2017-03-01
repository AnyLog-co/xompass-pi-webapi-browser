/**
 * Created by Yuyin on 29-02-2016.
 */
var path = require('path');
global.appRoot = path.resolve(__dirname);
global.isTest = false;
global.srvConfig = {}; // Server config
global.srvDConfig = {}; // Devices Config
global.srvPiConfig = {}; // PI System Config
global.httpData = {};
global.wsockets = require(appRoot + '/modules/websockets'); // Global to allow wsockets.log in any module
global.freader = require(appRoot + '/modules/file-reader'); // Used to manage Local Files. For more data handling connect to a DB

var defConfig = require(appRoot + '/config_files/config_default').defaultConfig;
var httpServer = require(appRoot + '/exp-server');
var interface = require(appRoot + '/modules/interface');

let dir = './settings/';

freader.setDefaultDir(dir);

freader.readFile('server_config.json', function (data) {
    srvConfig = JSON.parse(data) || defConfig;

    freader.readFile('server_devices_config.json', function (ddata) {
        srvDConfig = JSON.parse(ddata) || {};

        freader.readFile('server_pi_config.json', function (odata) {
            srvPiConfig = JSON.parse(odata) || {};
            start();
        });
    });
});


function start() {
    httpServer.start();
    interface.start();
}

//*************************
// Event: uncaughtException
process.on('uncaughtException', function (err) {
    console.log("Uncaught: " + err.code + " en Xompass Analysis Service :\n" + err.stack);
});