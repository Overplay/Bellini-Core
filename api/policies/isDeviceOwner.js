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



module.exports = function (req, res, next) {


    /*if (sails.config.policies.wideOpen) {
     sails.log.debug("In wideOpen policy mode, so skipping this policy!");
     return next();
     }*/

    var device = req.allParams();
    // fix for delete
    if (req.method == "DELETE") {
        Device.findOne(device.id)
            .then(function (d) {

                if (d) {
                    device = d;
                    if (req.session.user.id === device.deviceOwner) {
                        sails.log.debug(req.allParams(), "has access")
                        return next();
                    }
                }
                else {
                    sails.log.debug("Device not found when it should exist")
                    return res.badRequest('Device Not found, should exist.');
                }
            })
            .catch(function (err) {
                return res.serverError(err);
            })

    }
    //PUT for update 
    else if (req.session.user.id === device.deviceOwner.id) {
        sails.log.debug(req.allParams(), "has access")
        return next();
    }
    else if (RoleCacheService.hasAdminRole(req.session.user.roles)) {
        return next();
    }
    // User is not allowed
    // (default res.forbidden() behavior can be overridden in `config/403.js`)
    else
        return res.forbidden('You are not permitted to perform this action.');


};
