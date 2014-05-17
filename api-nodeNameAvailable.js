module.exports = function(app,pg,pgConfig){

// /nodeNameAvailable
// Returns whether a node name is available
app.get('/nodeNameAvailable', function(req, res) {
    var startTime = new Date();
    if(!req.query.name) {
        res.send(400, 'No Node Name in Request.')
        return
    }
    pg.connect(pgConfig, function(err, client, done) {
        if(err) {
            res.send(500,'Database Connection Error')
            console.log('DB Connection Error: ', err)
            return
        }
        client.query('SELECT COUNT(*) as count FROM ukhasnet.nodes WHERE name=$1;', [req.query.name], function(err, result) {
            done()
            if(err) {
                res.send(500,'Database Query Error')
                console.log('DB Query Error: ', err)
                return
            }
            var returnData={}
            if(result.rows[0].count==0) {
                returnData.ok=1
            } else if(result.rows[0].count==1) {
                returnData.ok=0
            } else {
                returnData.ok=0
                returnData.error=1
                returnData.message='Too many results for Node Name'
            }
            res.type('application/json')
            res.set('X-Response-Time', (new Date() - startTime)+'ms')
            res.send(returnData)
        });
    });
});

}
