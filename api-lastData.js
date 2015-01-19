module.exports = function(app,pg,pgConfig){

// /lastData
// Returns JSON of last Datapoint for requested Node and Data Type
app.get('/lastData', function(req, res) {
    var startTime = new Date();
    var since_time;
    if(!req.query.id) {
        res.send(400,'No Node id supplied.')
        return
    }
    if(!req.query.type) {
        res.send(400,'No Data Type id supplied.')
        return
    }
    pg.connect(pgConfig, function(err, client, done) {
        if(err) {
            res.send(500,'Database Connection Error')
            console.log('DB Connection Error: ', err)
            return
        }
        var outputData={}
        var dataQuery = client.query('SELECT data_float.data AS data, data_float.position as pos,data_float.fieldid AS typeid, fieldtypes.name as type, fieldtypes.dataid AS unit, packet_rx.packet_rx_time AS time from ukhasnet.data_float INNER JOIN (SELECT fieldtypes.id AS id,fieldtypes.name AS name,fieldtypes.dataid AS dataid FROM ukhasnet.fieldtypes) AS fieldtypes ON data_float.fieldid = fieldtypes.id INNER JOIN (SELECT id from ukhasnet.packet AS id WHERE originid=$1) AS packet ON packet.id = data_float.packetid INNER JOIN ukhasnet.packet_rx AS packet_rx on packet.id=packet_rx.packetid WHERE data_float.fieldid=$2 ORDER BY packet_rx.packet_rx_time DESC LIMIT 1;',[req.query.id, req.query.type])
        dataQuery.on('row', function(row, result) {
            outputData=row;
        })
        dataQuery.on('end', function(result) {
            done()
            res.type('application/json')
            res.set('X-Response-Time', (new Date() - startTime)+'ms')
            res.send(outputData)
            return
        })
        dataQuery.on('error', function(err) {
            done()
            res.send(500,'Database Query Error')
            console.log('DB Query Error: ', err)
            return
        })
    })
})

}
