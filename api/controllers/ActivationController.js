/**
 * ActivationController
 *
 * @description :: Server-side logic for managing Activations
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    //TODO more policy mapping
    generateCode: function (req, res) {

        
        
        //check req session and user 
        if (!req.session || !req.session.user) {
            return res.badRequest("user not logged in");

        }
        
        
        
        

        var code = '';
        var codeInUse = true;

        //prevent the code from being a duplicate
        async.whilst(function () {
            return codeInUse;
            }, function (next) {
                code = Math.random().toString(36).substr(2, 6).toUpperCase();

                Device.findOne({regCode: code})
                    .then(function (device) {
                        sails.log.debug(device);
                        if (!device)
                            codeInUse = false; // NO device with the code found

                    })
                    .catch(function (err) {
                        sails.log.debug("this is bad...");
                        codeInUse = false;
                        res.notFound("something very wrong happened");
                    });
                sails.log.debug(code)

            }, function (err) {
            }
        );


        var deviceObj = req.allParams();
        //TODO check params 
        //expecting name, location, venue 
        
        deviceObj.deviceOwner = req.session.user; //link user to device being created

        deviceObj.regCode = code;
        

        Device.create(deviceObj)
            .then(function (device) {
                sails.log.debug(device, "created");
                return res.json({code: device.regCode});

            })
            .catch(function (err) {
                return res.serverError(err); //give out error (will only show error info if not in production) 
            })

    }

};

