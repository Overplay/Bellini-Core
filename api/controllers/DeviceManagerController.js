/**
 * Created by mkahn on 4/26/17.
 */

var mirrorDest = sails.config.mirror && sails.config.mirror.ogdevice && sails.config.mirror.ogdevice.route;

module.exports = {

    proxy: function(req, res){

        var proxyUrl = req.url.split('/')[2];

        return res.ok();

    },

    alldevices: function( req, res ){

        if (req.method != 'GET'){
            return res.badRequest({error: 'bad verb'})
        }

        ProxyService.get(mirrorDest+'/all', req.query )
            .then(function(resp){
                return res.ok(resp.body);
            })
            .catch(res.serverError)

    },

    findByUDID: function ( req, res ) {

        if ( req.method != 'GET' ) {
            return res.badRequest( { error: 'bad verb' } )
        }

        var params = req.allParams();
        if (!params.deviceUDID){
            return res.badRequest( { error: 'need a fucking udid' } )
        }

        ProxyService.get( mirrorDest + '/findByUDID', "deviceUDID="+ params.deviceUDID )
            .then( function ( resp ) {
                return res.ok( resp.body );
            } )
            .catch(res.proxyError);

    }


}