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


        var code = Math.random().toString(36).substr(2, 6).toUpperCase();

        //need to make sure that the code is not already in use and maybe make sure
        //the code is clean 

        var deviceObj = {};
        deviceObj.deviceOwner = req.session.user;
        deviceObj.regCode = code;
        sails.log.debug(deviceObj);


        if ((deviceObj.deviceOwner === undefined))
            return res.badRequest();


        Device.create(deviceObj || {})
            .then(function (device) {
                sails.log.debug(device);
                return res.json({code: device.regCode});

            })
            .catch(function (err) {
                sails.log.debug("could not create device", err);
            })

        
        
    },

};

