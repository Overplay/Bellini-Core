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


    if ( PolicyService.isLoggedIn( req ) ||
        PolicyService.isPeerToPeer( req ) ||
        PolicyService.isMagicJwt( req ) )
        return next();

    // User is not allowed
    return res.forbidden( { error: 'not logged in'} );

};
