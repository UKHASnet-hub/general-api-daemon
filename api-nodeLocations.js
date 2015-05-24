module.exports = function(app,pg,pgConfig){

// /nodeLocations
// Returns a JSON location history for a given node
app.get('/nodeLocations', function(req, res) {
    var startTime = new Date();
    var since_time;
    if(!req.query.id && !req.query.name) {
        res.send(400,'No Node id or name supplied.')
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
    var filterfix = false
    if(req.query.filterfix) {
        filterfix = true
    }
    pg.connect(pgConfig, function(err, client, done) {
        if(err) {
            res.send(500,'Database Connection Error')
            console.log('DB Connection Error: ', err)
            return
        }
        var outputData=[]
        var dataQuery
        if(req.query.name) {
            dataQuery = client.query('SELECT data_location.latitude AS lat, data_location.longitude AS lon, data_location.altitude as alt, packet_rx.packet_rx_time AS time from ukhasnet.data_location INNER JOIN (SELECT id from ukhasnet.packet AS id WHERE originid = (SELECT id FROM ukhasnet.nodes WHERE name=$1 AND typeid=3)) AS packet ON packet.id = data_location.packetid INNER JOIN (SELECT packetid,packet_rx_time FROM ukhasnet.packet_rx WHERE packet_rx_time >= $2) AS packet_rx on packet.id=packet_rx.packetid ORDER BY packet_rx.packet_rx_time DESC;',[req.query.name, since_time.toISOString()])
        } else {
            dataQuery = client.query('SELECT data_location.latitude AS lat, data_location.longitude AS lon, data_location.altitude as alt, packet_rx.packet_rx_time AS time from ukhasnet.data_location INNER JOIN (SELECT id from ukhasnet.packet AS id WHERE originid = (SELECT id FROM ukhasnet.nodes WHERE id=$1 AND typeid=3)) AS packet ON packet.id = data_location.packetid INNER JOIN (SELECT packetid,packet_rx_time FROM ukhasnet.packet_rx WHERE packet_rx_time >= $2) AS packet_rx on packet.id=packet_rx.packetid ORDER BY packet_rx.packet_rx_time DESC;',[req.query.id, since_time.toISOString()])
        }
        dataQuery.on('row', function(row, result) {
            if(!filterfix) {
                outputData.push({'lat':row.lat,'lon':row.lon,'alt':row.alt,'t':row.time})
            } else {
                if(!(row.lat==0 && row.lat==0)) {
                    outputData.push({'lat':row.lat,'lon':row.lon,'alt':row.alt,'t':row.time})
                }
            }
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
