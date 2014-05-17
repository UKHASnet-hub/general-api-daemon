module.exports = function(app,pg,pgConfig){

// /editNode
// Change node options/parameters
app.post('/editNode', function(req, res) {
    var startTime = new Date();
    if(!req.body.id) {
        res.send(400, 'No Node ID in Request.')
        return
    }
    if(!req.body.owner && !req.body.typeid) {
        res.send(400, 'No Parameters to set in Request.')
        return
    }
    pg.connect(pgConfig, function(err, client, done) {
        if(err) {
            res.send(500,'Database Connection Error')
            console.log('DB Connection Error: ', err)
            return
        }
        var query
        if(req.body.owner && req.body.typeid) {
            query = client.query('UPDATE ukhasnet.nodes SET owner=$1, typeid=$2 WHERE id=$3', [req.body.owner, req.body.typeid, req.body.id])
        } else if(req.body.owner) {
            query = client.query('UPDATE ukhasnet.nodes SET owner=$1 WHERE id=$2', [req.body.owner, req.body.id])
        } else if(req.body.typeid) {
            query = client.query('UPDATE ukhasnet.nodes SET typeid=$1 WHERE id=$2', [req.body.typeid, req.body.id])
        } else {
            done()
            res.send(500,'Query Parameter Error')
            console.log('Query Parameter Error: editNode had no parameters.')
            return
        }
        query.on('end', function(result) {
            done()
            res.type('application/json')
            res.set('X-Response-Time', (new Date() - startTime)+'ms')
            if(result.rowCount==1) {
                res.send({'error':0})
            } else {
                res.send({'error':1, 'message':'Incorrect number of rows were modified'})
            }
            return
        })
        query.on('error', function(err) {
            done()
            res.send(500,'Database Query Error')
            console.log('DB Query Error: ', err)
            return
        })
    })
})

}
