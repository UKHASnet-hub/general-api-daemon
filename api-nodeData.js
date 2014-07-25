module.exports = function(app,pg,pgConfig){
var async = require('async')

// /nodeData
// Returns a JSON data for all/specified data field
app.get('/nodeData', function(req, res) {
    var startTime = new Date()
    if(!req.query.nodes) {
        res.send(400,'Parameter "nodes" is missing from request.')
        return
    }
    if(!req.query.startt) {
        res.send(400,'Parameter "startt" is missing from request.')
        return
    }
    var startt = new Date(Date.parse(req.query.startt))
    if(!req.query.endt) {
        var endt = new Date()
    } else {
        var endt = new Date(Date.parse(req.query.endt))
    }
    var nodeInfo = false
    if(req.query.info && req.query.info==1) {
        nodeinfo = true
    }
    var locations = false
    if(req.query.locations && req.query.locations==1) {
        res.send(400,'Locations from nodeData currently not supported.')
        return
    }
    pg.connect(pgConfig, function(err, client, done) {
        var tasks = []
        
        req.query.nodes.split(',').forEach( function(nodeid) {
            if(req.query.data) {
                req.query.data.split(',').forEach( function(nodeid) {
                    tasks.push(function(callback) {
                        var dataQuery = client.query('SELECT data_float.data AS data, data_float.position as pos,data_float.fieldid AS typeid, fieldtypes.name as type, fieldtypes.dataid AS unit, packet_rx.packet_rx_time AS time from ukhasnet.data_float INNER JOIN (SELECT fieldtypes.id AS id,fieldtypes.name AS name,fieldtypes.dataid AS dataid FROM ukhasnet.fieldtypes) AS fieldtypes ON data_float.fieldid = fieldtypes.id INNER JOIN (SELECT id from ukhasnet.packet AS id WHERE originid = $1) AS packet ON packet.id = data_float.packetid INNER JOIN (SELECT packetid,packet_rx_time FROM ukhasnet.packet_rx WHERE packet_rx_time >= $2 AND packet_rx_time < $3) AS packet_rx on packet.id=packet_rx.packetid ORDER BY packet_rx.packet_rx_time DESC;', [nodeid, startt.toISOString(), endt.toISOString()])
                        dataQuery.on('row', function(row, result) {
                            if(!result[row.typeid]) {
                                result[row.typeid]={}
                                result[row.typeid].t=row.unit
                            }
                            if(!result[row.typeid][row.pos]) {
                                result[row.typeid][row.pos]={}
                                result[row.typeid][row.pos].t=row.type+' '+row.pos
                                result[row.typeid][row.pos].data=[]
                            }
                            result[row.typeid][row.pos].data.push({'d':row.data,'t':row.time})
                        })
                        dataQuery.on('end', function(result) {
                            callback(null, result)
                        })
                        dataQuery.on('error', function(err) {
                            done()
                            res.send(500,'Database Query Error')
                            console.log('DB Query Error: ', err)
                            return
                        })
                    })
                })
            } else {
                tasks.push(function(callback) {
                    var dataQuery = client.query('SELECT data_float.data AS data, data_float.position as pos,data_float.fieldid AS typeid, fieldtypes.name as type, fieldtypes.dataid AS unit, packet_rx.packet_rx_time AS time from ukhasnet.data_float INNER JOIN (SELECT fieldtypes.id AS id,fieldtypes.name AS name,fieldtypes.dataid AS dataid FROM ukhasnet.fieldtypes) AS fieldtypes ON data_float.fieldid = fieldtypes.id INNER JOIN (SELECT id from ukhasnet.packet AS id WHERE originid = $1) AS packet ON packet.id = data_float.packetid INNER JOIN (SELECT packetid,packet_rx_time FROM ukhasnet.packet_rx WHERE packet_rx_time >= $2 AND packet_rx_time < $3) AS packet_rx on packet.id=packet_rx.packetid ORDER BY packet_rx.packet_rx_time DESC;', [nodeid, startt.toISOString(), endt.toISOString()])
                    dataQuery.on('row', function(row, result) {
                        if(!result[row.typeid]) {
                            result[row.typeid]={}
                            result[row.typeid].t=row.unit
                        }
                        if(!result[row.typeid][row.pos]) {
                            result[row.typeid][row.pos]={}
                            result[row.typeid][row.pos].t=row.type+' '+row.pos
                            result[row.typeid][row.pos].data=[]
                        }
                        result[row.typeid][row.pos].data.push({'d':row.data,'t':row.time})
                    })
                    dataQuery.on('end', function(result) {
                        callback(null, result)
                    })
                    dataQuery.on('error', function(err) {
                        done()
                        res.send(500,'Database Query Error')
                        console.log('DB Query Error: ', err)
                        return
                    })
                })
            }
        })
        if(err) {
            res.send(500,'Database Connection Error')
            console.log('DB Connection Error: ', err)
            return
        }
        async.parallelLimit(tasks,2,function(err, results){
            done()
            res.type('application/json')
            res.set('X-Response-Time', (new Date() - startTime)+'ms')
            res.send(results)
        })
    })
})

}
