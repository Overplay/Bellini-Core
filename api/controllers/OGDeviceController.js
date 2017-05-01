/**
 * Created by mkahn on 5/1/17.
 */


module.exports = {


    findByUDID: function ( req, res ) {

        if ( req.method != 'GET' )
            return res.badRequest( { error: "Bad Verb" } );

        var allParams = req.allParams();

        if ( !req.deviceUDID ) {
            res.badRequest( { error: 'no device UDID' } );
        }

        BDMService.OGDevice.findByUDID()
            .then( res.ok )
            .catch( res.proxyError );

    },

    findAll: function ( req, res ) {

        if ( req.method != 'GET' )
            return res.badRequest( { error: "Bad Verb" } );


        BDMService.OGDevice.findAll()
            .then( res.ok )
            .catch( res.proxyError );

    }

}

