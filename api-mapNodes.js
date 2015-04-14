module.exports = function(app,pg,pgConfig){

// /mapNodes
// Returns a JSON list of all nodes and their last locations
app.get('/mapNodes', function(req, res) {
    var startTime = new Date();
    pg.connect(pgConfig, function(err, client, done) {
        if(err) {
            res.send(500,'Database Connection Error')
            console.log('DB Connection Error: ', err)
            return
        }
        client.query("SELECT DISTINCT(nodes.id) AS id, nodes.name AS name, nodes.owner AS owner, nodetypes.icon AS icon, data_location.latitude AS lat, data_location.longitude AS lon, data_location.altitude AS alt FROM ukhasnet.data_location INNER JOIN ukhasnet.nodes ON nodes.locationid = data_location.id INNER JOIN ukhasnet.nodetypes ON nodetypes.id=nodes.typeid INNER JOIN ukhasnet.packet_rx ON packet_rx.packetid=nodes.lastpacket WHERE data_location.id IN (SELECT locationid FROM ukhasnet.nodes) AND nodes.typeid!=1 AND packet_rx.packet_rx_time>=(NOW()-'14 day'::INTERVAL);", function(err, result) {
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
