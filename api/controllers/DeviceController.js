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

        //TODO check timeout
        //TODO req params?
        var deviceObj = {};
        deviceObj.deviceOwner = req.session.user.id;
        deviceObj.regCode = params.regCode;


        sails.log.debug(deviceObj);

        Device.findOne(deviceObj)
            .then(function (device) {

                //check if device exists
                if (device) {
                    sails.log.debug(device);
                    params.regCode = '';
                    Device.update(device, params)
                        .then(function (device) {
                            sails.log.debug(device);

                        });


                    return res.json(device)
                }
                //find the user and finalize device details
                //wifi, ethernet, location, name, unique id, apitoken
                return res.notFound();
            })
            .catch(function (err) {
                return res.badRequest();
            });
        //find user with that activation code
        //tie device to user
    }
    
    
};

