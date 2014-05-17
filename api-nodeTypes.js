module.exports = function(app,pg,pgConfig){

// /nodeTypes
// Returns description of node types
app.get('/nodeTypes', function(req, res) {
    var startTime = new Date();
    pg.connect(pgConfig, function(err, client, done) {
        if(err) {
            res.send(500,'Database Connection Error')
            console.log('DB Connection Error: ', err)
            return
        }
        client.query('SELECT id as id, description as desc FROM ukhasnet.nodetypes;', function(err, result) {
            done()
            if(err) {
                res.send(500,'Database Query Error')
                console.log('DB Query Error: ', err)
                return
            }
            res.type('application/json');
            res.set('X-Response-Time', (new Date() - startTime)+'ms');
            res.send(result.rows)
        });
    });
});

}
