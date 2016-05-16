/**
 * DeviceController
 *
 * @description :: Server-side logic for managing devices
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {


    registerDevice: function (req, res) {
        //get code
        var params = req.allParams();
        //TODO req certain params? CEG
        if ((params.regCode === undefined)) //test other stuff too
            return res.badRequest();

        sails.log.debug(params);


        var deviceObj = {};

        /*use if the user is logged in on the box when registering??
         deviceObj.deviceOwner = req.session.user.id;
         */

        deviceObj.regCode = params.regCode;

        sails.log.debug(deviceObj);

        Device.findOne(deviceObj)
            .then(function (device) {

                //check if device exists
                if (device) {
                    //check if the timing is acceptable - run hook before lookup? 
                    var ca = device["createdAt"];
                    if (Date.now() < Date.parse(ca) + sails.config.device.regCodeTimeout) {
                        sails.log.debug(device, "being updated");
                        params.regCode = ''; //clear registration code 

                        //TODO JSONWebToken into apiToken field
                        params.apiToken = '';
                        //TODO UUID ?
                        //params.uniqueId = '';
                        //TODO MAC Address
                        //TODO Venue (base of user?) 

                        return Device.update(device, params);
                    }
                }

            }).then(function (devices) {
                if (devices.length > 1) //should never find and update more than one device
                    sails.log.debug("NOT GOOD UPDATE :(");
                sails.log.debug(devices, "updated/registered");
                return res.json(devices[0]);

            })
            .catch(function (err) {
                return res.notFound();
            });
    }


};

