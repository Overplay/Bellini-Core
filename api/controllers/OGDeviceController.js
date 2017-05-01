/**
 * Created by mkahn on 5/1/17.
 */


module.exports = {


    findByUDID: function ( req, res ) {

        if ( req.method != 'GET' )
            return res.badRequest( { error: "Bad Verb" } );

        BDMService.OGDevice.findByUDID(req.allParams().deviceUDID)
            .then( res.ok )
            .catch( res.proxyError );

    },

    all: function ( req, res ) {

        if ( req.method != 'GET' )
            return res.badRequest( { error: "Bad Verb" } );


        BDMService.OGDevice.findAll(req.query)
            .then( res.ok )
            .catch( res.proxyError );

    },

    update: function( req, res ){

        var params = req.allParams();

        BDMService.OGDevice.update( params.id, params )
            .then( res.ok )
            .catch( res.proxyError );

    }
}

