/**
 * isAdmin
 *
 * @module      :: Policy
 * @description :: Simple policy to allow authenticated admin user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */

// Policy code = 100.

module.exports = function ( req, res, next ) {


    if (PolicyService.isAdmin(req))
        return next();

    // User is not allowed
    return res.forbidden( { error: 'not authorized. Policy 100.' } );

};
