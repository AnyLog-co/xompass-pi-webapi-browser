/**
 * Created by Yuyin on 07-03-2016.
 */
var express = require('express');
var router = express.Router();
var interf = require('../modules/interface');
// Public Routes
router.get('/settings', function (req, res) {
    res.send(srvConfig);
});
router.post('/settings', function (req, res) {
    srvConfig = req.body;
    freader.saveFile('server_config.json', JSON.stringify(srvConfig, null, '\t'));
    res.send('Posted!');
});
router.get('/devices', function (req, res) {
    res.send(srvDConfig);
});
router.post('/devices', function (req, res) {
    srvDConfig = req.body;
    freader.saveFile('server_devices_config.json', JSON.stringify(srvDConfig, null, '\t'));
    res.send('Posted!');
});

router.get('/inputoutputs', function (req, res) {
    res.send(srvIOConfig);
});
router.post('/inputoutputs', function (req, res) {
    srvIOConfig = req.body;
    freader.saveFile('server_inputoutputs_config.json', JSON.stringify(srvIOConfig, null, '\t'));
    res.send('Posted!');
});
router.get('/rules', function (req, res) {
    res.send(srvRConfig);
});
router.post('/rules', function (req, res) {
    srvRConfig = req.body;
    freader.saveFile('server_rules_config.json', JSON.stringify(srvRConfig, null, '\t'));
    res.send('Posted!');
});

router.get('/formulas', function (req, res) {
    res.send(srvFConfig);
});
router.post('/formulas', function (req, res) {
    srvFConfig = req.body;
    freader.saveFile('server_formulas_config.json', JSON.stringify(srvFConfig, null, '\t'));
    res.send('Posted!');
});

router.get('/schedules', function (req, res) {
    res.send(srvSConfig);
});
router.post('/schedules', function (req, res) {
    srvSConfig = req.body;
    freader.saveFile('server_schedules_config.json', JSON.stringify(srvSConfig, null, '\t'));
    res.send('Posted!');
});

router.get('/start', function (req, res) {
    res.send(srvSConfig);
});
router.post('/start', function (req, res) {
    srvSConfig = req.body;
    freader.saveFile('server_schedules_config.json', JSON.stringify(srvSConfig, null, '\t'));
    res.send('Posted!');
});

router.get('/getallfromapi', function (req, res) {
    interf.getAllFromApi(function(){});
    setTimeout(function(){
        interf.genElementTree();
        res.send(srvPiConfig);
    }, 3000);
});

router.get('/pielements', function (req, res) {
    srvPiConfig.pathTree = {};
    srvPiConfig.pathTreeArray = [];
    interf.genElementTree();
    res.send(srvPiConfig);
});

router.post('/pielements', function (req, res) {
    srvPiConfig = req.body;
    freader.saveFile('server_pi_config.json', JSON.stringify(srvPiConfig, null, '\t'));
    interf.updateSubs();
    res.send('Posted!');
    console.log("New PI Config posted");
});

module.exports = router;