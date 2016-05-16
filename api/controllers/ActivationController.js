/**
 * ActivationController
 *
 * @description :: Server-side logic for managing Activations
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    generateCode: function (req, res) {

        sails.hooks.devicehook.clean(); //TODO remove this after it is set to run at intervals

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


        var deviceObj = {};
        deviceObj.deviceOwner = req.session.user; //link user to device being created
        deviceObj.regCode = code;

        sails.log.debug(deviceObj);

        if ((deviceObj.deviceOwner === undefined))
            return res.badRequest();


        Device.create(deviceObj)
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

