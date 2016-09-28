/**
 * has Same req ip
 *
 * @module      :: Policy
 * @description :: checks if the request has an ip that matches 
 *
 * @docs        :: http://waterlock.ninja/documentation
 */


module.exports = function (req, res, next) {


    /*if (sails.config.policies.wideOpen) {
        sails.log.debug("In wideOpen policy mode, so skipping this policy!");
        return next();
    }
    else {*/
    sails.log.debug(req.host == sails.config.localIp)
    next();
}
