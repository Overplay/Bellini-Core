/**
 * Created by mkahn on 5/8/17.
 */


module.exports = {

    ping: function(req, res){
        return res.ok({ ping: 'ack'});
    }

}