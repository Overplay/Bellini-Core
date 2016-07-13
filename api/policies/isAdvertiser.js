/**
 * Created by cole on 7/12/16.
 */
/**
 * sessionAuth
 *
 * @module      :: Policy
 * @description :: Simple policy to allow authenticated proprietor owner
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function ( req, res, next ) {


    if ( sails.config.policies.wideOpen ) {
        sails.log.debug("In wideOpen policy mode, so skipping this policy!");
        return next();
    }

    // User is allowed, proceed to the next policy,
    // or if this is the last policy, the controller
    if ( req.session.authenticated && !req.session.user.blocked && RoleCacheService.hasRole( req.session.user.roles, "advertiser", "" ) ) {
        return next();
    }

    // User is not allowed
    // (default res.forbidden() behavior can be overridden in `config/403.js`)
    return res.forbidden( 'You are not permitted to perform this action.' );
};
