/**
 * ActivationController
 *
 * @description :: Server-side logic for managing Activations
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    generateCode: function (req, res) {


        var params = req.allParams();


        //testing purposes 
        sails.hooks.devicehook.clean(); //TODO remove this after it is set to run at intervals

        sails.log.debug("ugh")

        var code = '';
        var codeInUse = true;
        
        //prevent the code from being a duplicate
        async.whilst(function () {
                return codeInUse
            }, function (next) {
                code = Math.random().toString(36).substr(2, 6).toUpperCase();

                Device.findOne({regCode: code})
                    .then(function (device) {
                        sails.log.debug(device);
                        if (!device)
                            codeInUse = false;

                    })
                    .catch(function (err) {
                        sails.log.debug("code in use failed...this should never happen though");
                        codeInUse = false;
                        res.notFound("something very wrong happened");
                    });
                sails.log.debug(code)

            }, function (err) {
            }
        )


        var deviceObj = {};
        deviceObj.deviceOwner = req.session.user; //link user to device being created
        deviceObj.regCode = code;
        sails.log.debug(deviceObj);


        if ((deviceObj.deviceOwner === undefined))
            return res.badRequest();


        Device.create(deviceObj || {})
            .then(function (device) {
                sails.log.debug(device, "created");
                return res.json({code: device.regCode});

            })
            .catch(function (err) {
                sails.log.debug("could not create device", err);
                return res.notFound("cannot create device"); 
            })


    }

};

