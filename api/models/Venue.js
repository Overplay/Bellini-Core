/**
 * Venue.js
 *
 * @description :: Venue where devices are managed. Eventually will reference Organization.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {

        name: {
            type: 'string',
            defaultsTo: ''
        },

        address: {
            type: 'json'
        },
        

        // For determining where a user is and whether venue is shown on the Mobile app
        // finder app 
        geolocation: {
            type: 'json'
        },

        showInMobileAppMap: {
            type: 'boolean',
            defaultsTo: true
        },

        publicWifiSSID: {
            type: 'string',
            defaultsTo: ''
        },

        devices: {
            collection: 'Device',
            via: 'venue'
        },

        venueOwner: {
            model: 'User'
        },

        organization: {
            model: 'Organization'
        }
    }
};

