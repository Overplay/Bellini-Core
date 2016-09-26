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
    //maybe just change this to a config ip and check request ip
        require('dns').lookup(require('os').hostname(), function (err, add, fam) {
            sails.log.debug(add)
            if (add.substr(0, 7) == "::ffff:") {
                add = add.substr(7)
            }
            var ip = req.ip;
            sails.log.debug(ip)
            if (req.ip.substr(0, 7) == "::ffff:") { //dealing with ipv6 
                ip = req.ip.substr(7)
            }            
            sails.log.debug(ip)

            sails.log.debug(add == ip, req.headers.host, req.host)
        })
    
    //}

    next();
}
