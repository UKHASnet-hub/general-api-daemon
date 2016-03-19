module.exports = function(app,pg,pgConfig){

// /nodePackets
// Returns a JSON list of the last n packets
app.get('/nodePackets', function(req, res) {
    var startTime = new Date();
    if(!req.query.id && !req.query.name) {
        res.send(400,'No Node id or name supplied.')
        return
    }
    var returnData={};
    pg.connect(pgConfig, function(err, client, done) {
        if(err) {
            res.send(500,'Database Connection Error')
            console.log('DB Connection Error: ', err)
            return
        }
        if(req.query.name) {
            client.query('SELECT upload.packet AS p, upload.time AS t FROM (SELECT id FROM ukhasnet.packet WHERE originid=(SELECT id FROM ukhasnet.nodes WHERE name=$1)) AS packet INNER JOIN ukhasnet.upload on upload.packetid=packet.id ORDER BY upload.time DESC LIMIT 5;', [req.query.name], function(err, result) {
                if(err) {
                    done()
                    res.send(500,'Database Query Error')
                    console.log('DB Query Error: ', err)
                    return
                }
                returnData.lPackets=result.rows
                /* ** Removed until we cache the boot packet in the nodes table to avoid this expensive query **
                client.query('SELECT upload.time AS lboot FROM ukhasnet.packet INNER JOIN ukhasnet.upload ON upload.packetid=packet.id WHERE packet.originid=(SELECT id FROM ukhasnet.nodes WHERE name=$1) AND packet.sequence=\'a\' ORDER BY upload.time DESC LIMIT 1;', [req.query.name], function(err, result) {
                    done()
                    if(err) {
                        res.send(500,'Database Query Error')
                        console.log('DB Query Error: ', err)
                        return
                    }
                    if(result.rows.length==0) {
                        returnData.lBoot=0;
                    } else {
                        returnData.lBoot=result.rows[0].lboot
                    }
                    res.type('application/json');
                    res.set('X-Response-Time', (new Date() - startTime)+'ms');
                    res.send(returnData)
                });
                **/
                returnData.lBoot=0;
                res.type('application/json');
                res.set('X-Response-Time', (new Date() - startTime)+'ms');
                res.send(returnData);
            });
        } else {
            client.query('SELECT upload.packet AS p, upload.time AS t FROM (SELECT id FROM ukhasnet.packet WHERE originid=$1) AS packet INNER JOIN ukhasnet.upload on upload.packetid=packet.id ORDER BY upload.time DESC LIMIT 5;', [req.query.id], function(err, result) {
                if(err) {
                    done()
                    res.send(500,'Database Query Error')
                    console.log('DB Query Error: ', err)
                    return
                }
                returnData.lPackets=result.rows
                /* ** Removed until we cache the boot packet in the nodes table to avoid this expensive query **
                client.query('SELECT upload.time AS lboot FROM ukhasnet.packet INNER JOIN ukhasnet.upload ON upload.packetid=packet.id WHERE packet.originid=$1 AND packet.sequence=\'a\' ORDER BY upload.time DESC LIMIT 1;', [req.query.id], function(err, result) {
                    done()
                    if(err) {
                        res.send(500,'Database Query Error')
                        console.log('DB Query Error: ', err)
                        return
                    }
                    if(result.rows.length==0) {
                        returnData.lBoot=0;
                    } else {
                        returnData.lBoot=result.rows[0].lboot
                    }
                    res.type('application/json');
                    res.set('X-Response-Time', (new Date() - startTime)+'ms');
                    res.send(returnData)
                });
                */
                done();
                returnData.lBoot=0;
                res.type('application/json');
                res.set('X-Response-Time', (new Date() - startTime)+'ms');
                res.send(returnData);
            });
        }
    });
});

}
