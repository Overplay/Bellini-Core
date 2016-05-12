/**
 * Created by cgrigsby on 5/11/16.
 */


module.exports = function deviceHook(sails) {

    return {

        clean: function () {
            var timeout = sails.config.device.regCodeTimeout;
            //step through devices and delete ones that aren't registered after the timeout
            Device.find({regCode: {'!': ''}})
                .then(function (devices) {
                    //delete the ones with a createdAt
                    devices.forEach(function (device) {

                        var ca = device["createdAt"];
                        if (Date.now() > Date.parse(ca) + timeout) {
                            sails.log.debug("TIMEDOUT", device["regCode"]);
                            Device.destroy({id: device["id"]})
                                .then(function (d) {
                                    sails.log.debug(d, "deleted")
                                });

                        }


                    });

                });
        }


    }


};