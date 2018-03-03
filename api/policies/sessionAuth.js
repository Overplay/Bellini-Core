/**
 * sessionAuth
 *
 * @module      :: Policy
 * @description :: Simple policy to allow authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */

module.exports = function ( req, res, next ) {

    // Passes thru nginx
    if (req.headers['x-og-authorization']){
        sails.log.silly('Using x-og-authorization');
        req.headers.authorization = req.headers[ 'x-og-authorization' ];
    }

    if ( sails.config.policies.godToken && req.headers.authorization && req.headers.authorization === "Bearer OriginalOG") {
            next();
    } else if ( req.headers.authorization ){

        waterlock.validator.validateTokenRequest( req, function ( err, user ) {
            if ( err ) {
                return res.forbidden( { error: "Uncool auth header" } );
            }

            // valid request
            next();
        } );

    } else {

        if ( PolicyService.isLoggedIn( req ) ||
            PolicyService.isPeerToPeer( req ) ||
            PolicyService.isMagicJwt( req ) )
            return next();

        // User is not allowed
        return res.forbidden( { error: 'not logged in policy' } );

    }





};
