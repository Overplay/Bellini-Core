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

        if ((params.regCode === undefined)) //test other stuff too
            return res.badRequest();

        sails.log.debug(params);

        //TODO req certain params? CEG
        var deviceObj = {};
        //use this if the user is logged in on the box when registering
        //deviceObj.deviceOwner = req.session.user.id;

        deviceObj.regCode = params.regCode;


        sails.log.debug(deviceObj);

        Device.findOne(deviceObj)
            .then(function (device) {

                //check if device exists
                if (device) {
                    //check if the timing is acceptable - run hook before lookup instead?
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

                        Device.update(device, params) //should never find and update more than one device
                            .then(function (devices) {
                                if (devices.length > 1)
                                    sails.log.debug("NOT GOOD UPDATE :(");
                                sails.log.debug(devices, "updated/registered");

                            })
                            .catch(function (err) {
                                sails.log.debug(devices, "NOT REGISTERED");
                            });


                        return res.json(device);
                    }
                    //return not found?
                }
                return res.notFound();
            })
            .catch(function (err) {
                return res.badRequest();
            });
    }


};

