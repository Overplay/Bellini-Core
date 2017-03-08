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
        venues: {
            server: 'localhost:2001'
        }
    }


};
