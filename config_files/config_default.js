/**
 * Created by Yuyin on 07-03-2016.
 */
exports.defaultConfig =
    {
        "server_name": "Xompass PI WebAPI Interface",
        "server_http_port": 7400,
        "server_test_mode": false,
        "server_log_clean_interval": 120,
        "webapi_host": "devdata.osisoft.com",
        "username": "webapiuser",
        "password": "!try3.14webapi!",
        "requestLastPoint": true,
        "looptime": 1000,
        "busServer": {
            "name": "Edge PI WebAPI BUS Server",
            "port": 5004
        },
        "busTarget": {
            "name": "Xompass FaaS Cloud Redirect Service",
            "addr": "localhost",
            "port": 5000,
            "hold": true,
            "enabled": false
        },
        "busTarget2": {
            "name": "Xompass Control Loopback Edge Service",
            "addr": "localhost",
            "port": 5006,
            "hold": true,
            "enabled": false
        }
    }