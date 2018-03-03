/**
 * password change
 *
 * @module      :: Policy
 * @description :: Simple policy to allow authenticated or with reset token
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function (req, res, next) {

    // ring 1 is cool
    if ( req.session.authenticated && !req.session.user.auth.blocked && req.session.user.auth.ring === 1 ) {
        return next();
    }

    // User is allowed, proceed to the next policy, 
    // or if this is the last policy, the controller
    if (req.session.authenticated && req.session.user && req.session.user.auth.email === req.allParams().email) {
        return next();
    }


    if (req.session.resetToken) {
        return next();
    }

    sails.log.silly('Falling out of passwordChange policy! User: ' + req.session.user );
    // User is not allowed
    // (default res.forbidden() behavior can be overridden in `config/403.js`)
    return res.forbidden({ error: 'You are not permitted to perform this action.'});
};
