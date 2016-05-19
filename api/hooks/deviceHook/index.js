/**
 * Created by cgrigsby on 5/11/16.
 */


module.exports = function deviceHook(sails) {

    var deviceConfig;
    var cronDelay;
    var timeout;


    return {

        configure: function () {
            if (!sails.config.device || !sails.config.device.hookEnabled) {
                sails.log.warn("There's no config file for device or its hook is disabled... ");
            }

            deviceConfig = sails.config.device;
        },

        initialize: function (cb) {
            if (!sails.config.device || !sails.config.device.hookEnabled) {
                sails.log.warn("There's no config file for device or its hook is disabled... ");
                return cb();
            }
            timeout = sails.config.device.regCodeTimeout || (1000 * 60 * 60);
            //timeout = (1000 * 60);
            cronDelay = deviceConfig.cleanDelay || (1000 * 60 * 60 * 12);
            //cronDelay = 10000;
            sails.log.debug('Device cleaner will clean with this period: ' + cronDelay / 1000 + 's');

            setTimeout(sails.hooks.devicehook.clean, cronDelay);


            return cb();

        },

        clean: function () {
            //step through devices and delete ones that aren't registered after the timeout

            Device.find({regCode: {'!': ''}})
                .then(function (devices) {
                    devices.forEach(function (device) {

                        var ca = device["createdAt"];
                        if (Date.now() > Date.parse(ca) + timeout) {
                            sails.log.debug("TIMEDOUT", device["regCode"]);
                            Device.destroy({id: device["id"]})
                                .then(function (d) {
                                    sails.log.debug(d, "deleted");
                                })
                                .catch(function (err) {
                                    sails.log.debug("big problem in device clean hook")

                                })
                        }


                    });

                });

            setTimeout(sails.hooks.devicehook.clean, cronDelay);

        }


    }


};