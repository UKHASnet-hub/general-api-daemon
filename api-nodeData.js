module.exports = function(app,pg,pgConfig){

// /nodeData
// Returns a JSON data for all/specified data field
app.get('/nodeData', function(req, res) {
    var startTime = new Date();
    var since_time;
    if(!req.query.id) {
        res.send(400,'No Node id supplied.')
        return
    }
    if(!req.query.since) {
        if(!req.query.period) {
            res.send(400,'No Time period specified.')
            return
        } else {
           since_time = new Date(new Date() - req.query.period*1000);
        }
    } else {
        since_time = new Date(Date.parse(req.query.since));
    }
    pg.connect(pgConfig, function(err, client, done) {
        if(err) {
            res.send(500,'Database Connection Error')
            console.log('DB Connection Error: ', err)
            return
        }
        var outputData={}
        if(!req.query.types) {
            var dataQuery = client.query('SELECT data_float.data AS data, data_float.position as pos,data_float.fieldid AS typeid, fieldtypes.name as type, fieldtypes.dataid AS unit, packet_rx.packet_rx_time AS time from ukhasnet.data_float INNER JOIN (SELECT fieldtypes.id AS id,fieldtypes.name AS name,fieldtypes.dataid AS dataid FROM ukhasnet.fieldtypes) AS fieldtypes ON data_float.fieldid = fieldtypes.id INNER JOIN (SELECT id from ukhasnet.packet AS id WHERE originid = $1) AS packet ON packet.id = data_float.packetid INNER JOIN (SELECT packetid,packet_rx_time FROM ukhasnet.packet_rx WHERE packet_rx_time >= $2) AS packet_rx on packet.id=packet_rx.packetid ORDER BY packet_rx.packet_rx_time DESC;',[req.query.id, since_time.toISOString()])
        } else {
            done()
            res.send(400,'Specific Data Types not currently supported.')
            return
        }
        dataQuery.on('row', function(row, result) {
            if(!outputData[row.typeid]) {
                outputData[row.typeid]={}
                outputData[row.typeid].t=row.unit
            }
            if(!outputData[row.typeid][row.pos]) {
                outputData[row.typeid][row.pos]={}
                outputData[row.typeid][row.pos].t=row.type+' '+row.pos
                outputData[row.typeid][row.pos].data=[]
            }
            outputData[row.typeid][row.pos].data.push({'d':row.data,'t':row.time})
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
