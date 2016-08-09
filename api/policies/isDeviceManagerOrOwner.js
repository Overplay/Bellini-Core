/**
 * Created by cgrigsby on 5/18/16.
 */


//TODO needs testing 
module.exports = function (req, res, next) {

    var device = req.allParams();

    if (sails.config.policies.wideOpen) {
        sails.log.debug("In wideOpen policy mode, so skipping this policy!");
        return next();
    }

    else {
        Device.findOne(device.id)
            .then(function (d) {

                if (d) {
                    device = d;
                    User.findOne(req.session.user.id)
                        .populate("ownedVenues")
                        .populate("managedVenues")
                        .then(function (user) {
                            if (_.filter(_.union(user.ownedVenues, user.managedVenues), function (v) {
                                    return device.venue === v.id;
                                })) {
                                sails.log.debug(req.allParams(), "has access")
                                return next();
                            }
                            else {
                                return res.forbidden('You are not permitted to perform this action.');

                            }
                        })
                    //check if current users ownedVenues matches up with the devices venue id

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

}