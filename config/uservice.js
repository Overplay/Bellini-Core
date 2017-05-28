/**
 * Created by mkahn on 2/24/17.
 *
 * These are the microservice settings for each microservice app
 *
 * CORE:        runs on port 2000
 * DEVICE MGR:  runs on port 2001
 * PGS:         runs on port 2002
 *
 */



module.exports = {

    // Main port this service runs on
    port: process.env.PORT || 2000,

    // Where to mirror stuff to (bad architecture?) and not implemented yet
    mirror: {
        venues:   {
            route: 'http://localhost:2001/venue/replicate'
        },
        ogdevice: {
            route: 'http://localhost:2001/ogdevice'
        }
    },

    uservice: {

        deviceManager: {
            url: 'http://localhost:2001'
        }

    },

    security: {
        // This should be commented out for production. Bypasses JWT check and only looks for the signature below.
        magicJwt: 'Bearer of_good_tidings'
    }

};
