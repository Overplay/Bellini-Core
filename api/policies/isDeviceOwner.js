/**
 * Created by cgrigsby on 5/16/16.
 */


/**
 * sessionAuth
 *
 * @module      :: Policy
 * @description :: Simple policy to allow authenticated device owner modify device
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */


//TODO decide what roles can modify a device
module.exports = function (req, res, next) {


    /* if ( sails.config.policies.wideOpen ) {
     sails.log.debug("In wideOpen policy mode, so skipping this policy!");
     return next();
     }*/

    sails.log.debug(req, req.session.user.devices)

    //TODO figure out a good way to test this, (DELETE makes is challenging with just device id)
    var device = req.allParams();
    if (req.session.user.id === device.deviceOwner.id) {
        sails.log.debug(req.allParams(), "has access")
        return next();
    }

    // User is not allowed
    // (default res.forbidden() behavior can be overridden in `config/403.js`)
    return res.forbidden('You are not permitted to perform this action.');


};
