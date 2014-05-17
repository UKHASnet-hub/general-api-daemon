module.exports = function(app,pg,pgConfig){

// /nodeInfo
// Returns a JSON list of all nodes
app.get('/nodeInfo', function(req, res) {
    var startTime = new Date();
    pg.connect(pgConfig, function(err, client, done) {
        if(err) {
            res.send(500,'Database Connection Error')
            console.log('DB Connection Error: ', err)
            return
        }
        var query
        if(req.query.id) {
            query = client.query('SELECT id,name,owner,typeid FROM ukhasnet.nodes WHERE id=$1;', [req.query.id])
        } else {
            query = client.query('SELECT id,name,owner,typeid FROM ukhasnet.nodes ORDER BY id ASC;')
        }
        query.on('row', function(row, result) {
            result.addRow(row)
        })
        query.on('end', function(result) {
            done()
            res.type('application/json')
            res.set('X-Response-Time', (new Date() - startTime)+'ms');
            res.send(result.rows)
            return
        })
        query.on('error', function() {
            done()
            res.send(500,'Database Query Error')
            console.log('DB Query Error: ', err)
            return
        })
    })
})

}
