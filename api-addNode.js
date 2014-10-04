module.exports = function(app,pg,pgConfig){

// /addNode
// Add a node to the node table
app.post('/addNode', function(req, res) {
    var startTime = new Date();
    if(!req.body.name) {
        res.send(400, 'No node name given.')
        return
    }
    var owner=''
    if(req.body.owner) {
        owner = req.body.owner
    }
    pg.connect(pgConfig, function(err, client, done) {
        if(err) {
            res.send(500,'Database Connection Error')
            console.log('DB Connection Error: ', err)
            return
        }
        client.query('SELECT COUNT(*) as count FROM ukhasnet.nodes WHERE name=$1;', [req.body.name.name], function(err, result) {
            if(err) {
                res.send(500,'Database Query Error')
                console.log('DB Query Error: ', err)
                return
            }
            var returnData={}
            if(result.rows[0].count==0) {
                client.query('INSERT INTO ukhasnet.nodes (name,owner) VALUES ($1, $2)', [req.body.name, owner], function(err, result) {
                    done()
                    if(err) {
                        res.send(500,'Database Query Error')
                        console.log('DB Query Error: ', err)
                        return
                    }
                    res.type('application/json')
                    res.set('X-Response-Time', (new Date() - startTime)+'ms')
                    res.send({'error':0})
                });
            } else {
                done()
                res.type('application/json')
                res.set('X-Response-Time', (new Date() - startTime)+'ms')
                res.send({'error':1})
            }
        });
    });
});

}
