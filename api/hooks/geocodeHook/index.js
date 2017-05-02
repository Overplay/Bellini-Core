/**
 * Created by cgrigsby on 5/11/16.
 */


module.exports = function geocodeHook(sails) {

    var cronDelay;


    return {

        configure: function () {
            // if (!sails.config.hooks.deviceCleaner || !sails.config.hooks.deviceCleaner.hookEnabled) {
            //     sails.log.warn("There's no config file for device or its hook is disabled... ");
            // }
            //
            // deviceConfig = sails.config.hooks.deviceCleaner;

            sails.log.silly("Configuring Geocode hook");
        },

        initialize: function (cb) {

            setTimeout(sails.hooks.geocodehook.code, 5000);
            return cb();

        },

        code: function () {
            //step through devices and delete ones that aren't registered after the timeout

            sails.log.silly("Doing some geocoding");

            // TODO
            Venue.find({})
                .then( function(allvs){

                    allvs.forEach( function(v){

                        sails.log.silly("Checking geocoding on: "+v.name);
                        var isGeocoded = v.geolocation && v.geolocation.latitude;
                        if (!isGeocoded && ( v.address && v.address.city)){
                            var address = v.address.street + ',' +
                                v.address.city + ',' +
                                v.address.state + ' ' +
                                v.address.zip;
                            sails.log.silly( "Geocoding on: " + address );

                            GeocodeService.geocode(address)
                                .then( function(results){
                                    if (!results.length){
                                        sails.log.silly( "Bad geocode result!" );
                                        return;
                                    }

                                    sails.log.silly( "Geocode returned this many hits: "+results.length );

                                    var gv = results[0];
                                    v.geolocation = { latitude: gv.geometry.location.lat,
                                        longitude: gv.geometry.location.lng };
                                    v.googlePlaceId = gv.place_id;
                                    return v.save();
                                })
                                .catch( function(err){
                                    sails.log.error('Coulnd geocode');
                                })
                        }
                    })
                })

            setTimeout(sails.hooks.geocodehook.code, 60*1000*60);

        }


    }


};