/**
 * Venue.js
 *
 * @description :: Venue where devices are managed. Eventually will reference Organization.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var uuid = require( 'uuid/v4' );
var request = require( 'superagent-bluebird-promise' );


module.exports = {

    attributes: {

        name: {
            type: 'string',
            defaultsTo: ''
        },

        yelpId: {
            type: 'string',
            defaultsTo: ''
        },

        uuid: {
            type: 'string',
            unique: true
        },

        address: {
            type: 'json'
        },

        // Array of Mongo Ids of Media associated with this venue
        photos: {
            type: 'array',
            defaultsTo: []
        },
        
        // This is a denormalized way of saving the logo image. We just stash the Mongo id here instead of
        // using relationships. We need to figure out what the right way is for this app.
        logo: {
            type: 'string',
            defaultsTo: ''
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

        venueOwners: {
            collection: 'User',
            via: 'ownedVenues'
        },

        venueManagers: {
            collection: 'User',
            via: 'managedVenues'
        },

        organization: {
            model: 'Organization'
        },

        textHistory: {
            type: 'array',
            defaultsTo: []
        },

        sponsorships: {
            type: 'array',
            defaultsTo: []
        },

        // used for "Virtual Venues" like "Limbo" where devices are before associated.
        virtual: {
            type:       'boolean',
            defaultsTo: false
        }
    },

    replicateToDM: function( record, cb, isNew ){

        var mirrorDest = sails.config.mirror && sails.config.mirror.venues && sails.config.mirror.venues.route;
        if ( mirrorDest ){
            sails.log.silly( "Replicating venue to peer Bellini-DM" );
            var liteVenue = _.pick(record, ['name', 'address', 'uuid', 'virtual']);
            
            request
                .post(mirrorDest)
                .send(liteVenue)
                .then(function(resp){
                    sails.log.silly("Replicated");
                })
                .catch(function(err){
                    sails.log.silly("Rep failed");
                })
        }

        cb();

    },

    beforeCreate: function( values, cb ){
        // Generate UUID
        values.uuid = uuid();
        cb();
    },

    afterCreate: function( record, cb ){
        this.replicateToDM( record, cb, true );
    },

    afterUpdate: function ( record, cb ) {
        this.replicateToDM( record, cb );
    }


};