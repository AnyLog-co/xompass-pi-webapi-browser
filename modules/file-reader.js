/**
 * Created by Andres Ulloa
 * File Reader v1.1.4
 */
let fs = require('fs');
let path = require('path');
let default_dir = path.join(__dirname, '/../../../config_files/');
let child_process = require('child_process');
/* Example
 * 
readFile('servers.json', function(data){
	console.log(data);
})
 * */
let crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = 'rkWazcDmgvFur4tA';

function encrypt(text){
    var cipher = crypto.createCipheriv(Buffer.from(algorithm,password))
    var crypted = cipher.update(text,'utf8','hex')
    crypted += cipher.final('hex');
    return crypted;
}

function decrypt(text){
    var decipher = crypto.createDecipher(algorithm,password)
    var dec = decipher.update(text,'hex','utf8')
    dec += decipher.final('utf8');
    return dec;
}

exports.setDefaultDir = function(dir){
    default_dir = dir;
    if(process.platform == 'win32'){
        default_dir = default_dir.replace(/\//g, '\\');
        child_process.exec("mkdir " + default_dir, {}, function(err){
            if(err){
                if(new RegExp(/already exists/).test(err)){
                    console.log("Dir Already Exists");
                    return;
                }
                console.log(err);
                default_dir = path.join(__dirname, '/../../../config_files/');
            }
        });
    }else if(process.platform == 'linux'){
        child_process.exec("mkdir -p " + default_dir, {}, function(err){
            if(err){
                console.log(err);
                default_dir = path.join(__dirname, '/../../../config_files/');
            }
        });
    }else{
        console.error("Cannot create DefaultDir due to Unsupported system: " + process.platform);
    }
};

exports.readFile = function(_filename, callback, options){
	let filename = default_dir + _filename;
	fs.stat(filename, function(err, stat) {
	    if(err == null) {
	        console.log('Loading file: ' + _filename);
	    	let obj = {};
            if(options && options.encoding === 'buffer'){
                fs.readFile(filename, function (err, data) {
                    if (err) throw err;
                    callback(decrypt(data));
                });
            }else{
                fs.readFile(filename, 'utf8', function (err, data) {
                    if (err) throw err;
                    callback(decrypt(data));
                });
            }
	    }else {
	        console.log('Filed to load file ' + filename + ': ', err.code);
			callback(null);
	    }
	});
};

exports.saveFile = function(_filename, data, callback){
	let filename = default_dir + _filename;
    if(callback)
        fs.writeFile(filename, encrypt(data), callback);
    else
        fs.writeFile(filename, encrypt(data));
};

/*
* TODO: appendFile not working anylonger when using crypto
* */
/*exports.appendFile = function(_filename, data){
	let filename = default_dir + _filename;
    fs.appendFile(filename, data);
};*/

exports.defaultConfig =
{
    "server_name": "Default HTTP Server Settings",
    "server_http_port": 80,
    "server_test_mode": false,
    "server_log_clean_interval": 120,
    "busTarget": {
        "name": "Default BUS Primary Target Server",
        "addr": "api.xompass.com",
        "port": 5001
    },
    "busTarget2": {
        "name": "Default BUS Secondary Target Server",
        "addr": "api.xompass.com",
        "port": 5000
    },
    "busServer":{
        "name": "Default BUS Server Listener",
        "port": 5000
    },
    "redirectServer":{
        "name": "Default data Redirect Server",
        "port": 3000
    },
    "dataServer":{
        "name": "Default Data Server Name",
        "device_protocol": "FF",
        "comm_protocol": "MODBUS",
        "port": 5006,
        "min_looptime": 1000, //ms
        "device_timeout": 600000, //ms
    }
};
