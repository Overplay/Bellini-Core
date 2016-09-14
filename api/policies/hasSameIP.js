/**
 * has Same req ip
 *
 * @module      :: Policy
 * @description :: checks if the request has an ip
 *
 * @docs        :: http://waterlock.ninja/documentation
 */

// TODO: Should be able to combine this with the other auth policies to create a single
// Policy.


//Waterlock methods to get user and stuff too so we should figure it out
module.exports = function (req, res, next) {


    /*if (sails.config.policies.wideOpen) {
        sails.log.debug("In wideOpen policy mode, so skipping this policy!");
        return next();
    }
    else {*/
        require('dns').lookup(require('os').hostname(), function (err, add, fam) {
            sails.log.debug(add)
        })
        sails.log.debug(req.ip)
    //}

    next();
}
