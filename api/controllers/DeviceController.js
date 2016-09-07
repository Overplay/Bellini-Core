/**
 * DeviceController
 *
 * @description :: Server-side logic for managing devices
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    /*
        given an activation code, registerDevice searches for a device with this code
        if it exists, it removes the code, and updates the device information so that it is active
        if it does not exist, the code was incorrect / a user never started the registration proc for it
     */
    registerDevice: function (req, res) {
        //get code
        var params = req.allParams();
        /*req certain params? CEG

         wifi mac address -tbd 
         code 
         */
        if ((params.regCode === undefined)) //test other stuff too
            return res.badRequest({ "error" : "No registration code specified" });


        var deviceObj = {};

        /*use if the user is logged in on the box when registering??
         deviceObj.deviceOwner = req.session.user.id;
         */

        deviceObj.regCode = params.regCode;

        //sails.log.debug(deviceObj, "searching ");

        return Device.findOne(deviceObj)
            .then(function (device) {

                //check if device exists
                if (device) {
                    var ca = device["createdAt"];
                    if (Date.now() < Date.parse(ca) + sails.config.device.regCodeTimeout) {
                        sails.log.debug(device, "being updated");
                        params.regCode = ''; //clear registration code 

                        //TODO JSONWebToken into apiToken field
                        //params.apiToken = '';
                        //TODO MAC Address -- done on android device :) - will act as UUID 
                        params.wifiMacAddress = 'FETCH FROM ANDROID'; //in req? 

                        return Device.update({id: device.id}, params);
                    }
                }

            }).then(function (devices) {
                if (devices.length != 1) //should never find and update more than one device
                    sails.log.debug("NOT GOOD UPDATE :(");
                sails.log.debug(devices, "updated/registered");
                return res.ok(devices[0]);

            })
            .catch(function (err) {
                return res.badRequest({ "error" : "Error registering device" });
            });
    },

    //TODO remove once production
    //creates a test device for demo purposes 
    testDevice: function(req, res) {
        //sails.log.debug(req.allParams());
        return Device.create(req.allParams())
            .then(function(dev){
                //sails.log.debug(dev)
                return res.ok(dev)
            })
            .catch(function(err){
                sails.log.debug(err)
            })
    },

    // backup: function (req, res) {
    //
    //     var params = req.allParams();
    //
    //     if (!params || !params.id || !params.backup)
    //         return res.badRequest("Missing params");
    //
    //     Device.findOne({ id: params.id })
    //         .then( function (device) {
    //             if (!device) {
    //                 return res.badRequest("Device not found");
    //             }
    //             device.deviceBackup = params.backup;
    //
    //             return Device.update({ id: device.id }, device)
    //
    //         })
    //
    // },




};

