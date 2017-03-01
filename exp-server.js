/**
 * Created by Yuyin on 29-02-2016.
 */
var start = function() {
    var port = srvConfig.server_http_port || process.env.PORT;

    var express = require('express');
    var bodyParser = require('body-parser');
    var admin_routes = require(appRoot + '/routes/admin-routes');
    var user_routes = require(appRoot + '/routes/user-routes');
    var public_routes = require(appRoot + '/routes/public-routes');
    var app = express();

    // WebSocket
    var expressWs = require('express-ws')(app);
    var ws_routes = require(appRoot + '/routes/ws-routes');

    // Middlewares
    app.use(express.static(appRoot + '/www'));
    app.use( bodyParser.json({limit: '50mb'}) );

    // Agregar custom middlewares a las rutas, por ejemplo autenticacion (ver memoria-backend yuyo ejemplo auth0)
    //app.use('/user', authenticate);
    //app.use('/admin', authenticate);

    // Archivos de rutas
    app.use('/', public_routes);
    app.use('/ws', ws_routes);
    app.use('/user', user_routes);
    app.use('/admin', admin_routes);

    // Server init
    app.listen(port, function () {
        console.log('Express Server listening on port: ' + port);
    });

    return this;
}

exports.start = start;