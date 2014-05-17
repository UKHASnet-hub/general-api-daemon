var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var http = require('http')
var server = http.createServer(app)
var port = 3001
var pg = require('pg')
var pgConfig = require('./config.json')

app.disable('x-powered-by');
app.use(bodyParser())

console.log('HTTP: Setting up Router..')

// Main page, probably serve this from a HTML file in the future
app.get('/', function(req, res) {
  res.type('text/html')
  res.send('Welcome to UKHASnet-APIv3')
})

// Website-specific API
require('./api-mapNodes')(app,pg,pgConfig)
require('./api-nodeGraphData')(app,pg,pgConfig)

// Node Info/Data API
require('./api-nodeInfo')(app,pg,pgConfig)
require('./api-nodePackets')(app,pg,pgConfig)
require('./api-nodeData')(app,pg,pgConfig)
require('./api-nodeLocations')(app,pg,pgConfig)
require('./api-nodeTypes')(app,pg,pgConfig)

// Node Configuration API
require('./api-addNode')(app,pg,pgConfig)
require('./api-editNode')(app,pg,pgConfig)
require('./api-nodeNameAvailable')(app,pg,pgConfig)

// 404 handler, probably serve this from a HTML file in the future
app.use(function(req, res){
    res.type('text/html')
    res.send(404, '<h2>API URL not found</h2>API Documentation at <a href="http://www.ukhas.net/wiki/api">http://www.ukhas.net/wiki/api</a>');
});

console.log('HTTP: Router Initialised')

console.log('DB: Testing Connection..')

pg.connect(pgConfig, function(err, client, done) {
    if(err) {
        console.log('DB: Connection Error: ', err)
        return
    }
    client.query('SELECT 1;', function(err, result) {
        done()
        if(err) {
            console.log('DB: Query Error: ', err)
            return
        } else {
            console.log('DB: Connection OK')
            start_api()
        }
    })
})

function start_api() {
    server.listen(port)
    console.log('ukhas.net API v0.3 now running on port '+port)
}
