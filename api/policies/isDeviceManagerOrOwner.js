/**
 * Created by cgrigsby on 5/18/16.
 */


//TODO test
module.exports = function (req, res, next) {

    var device = req.allParams();

    sails.log.debug(device.deviceManagers);

    sails.log.debug(req.session.user.id)

    sails.log.debug(_.find(device.deviceManagers, {id: req.session.user.id}))

    if (sails.config.policies.wideOpen) {
        sails.log.debug("In wideOpen policy mode, so skipping this policy!");
        return next();
    }


    if ((req.session.user.id === device.deviceOwner.id)
        || (_.find(device.deviceManagers, {id: req.session.user.id}))) {
        sails.log.debug(req.allParams(), "has access")
        return next();
    }

    else
        return res.forbidden('You are not permitted to perform this action.');

}