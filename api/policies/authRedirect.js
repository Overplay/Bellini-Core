/**
 * authRedirect
 *
 * @module      :: Policy
 * @description :: Redirects an already logged in user to the dashbaord
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
 
module.exports = function ( req, res, next ) {
    

    if ( req.session.authenticated && !req.session.user.auth.blocked ) {
        return res.redirect( sails.config.theme.uiAppRoute );
    }

    return next();

};