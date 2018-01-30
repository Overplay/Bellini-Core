/**
 * User
 *
 * @module      :: Model
 * @description :: This is the base user model
 * @docs        :: http://waterlock.ninja/documentation
 */

var Promise = require( 'bluebird' );
var uuid = require( 'uuid/v4' );


module.exports = {

    attributes: require( 'waterlock' ).models.user.attributes( {

        // Included in the waterlock base user model are:
        /*
         {
         "auth": {
         "password": "$2a$10$lXs7hexMrvaz2tBVVZcuEugM8fsNOX/Ww3akh3DBn0OloEpmmjJ1."
         "email": "mitch@overplay.io"
         "createdAt": "2016-04-05T15:57:22.427Z"
         "updatedAt": "2016-04-05T15:57:22.454Z"
         "id": 1
         }-
         "createdAt": "2016-04-05T15:57:22.449Z"
         "updatedAt": "2016-04-05T15:57:22.449Z"
         "id": 1
         }
         */
        
        firstName: {
            type:       'string',
            defaultsTo: ''
        },

        lastName: {
            type:       'string',
            defaultsTo: ''
        },

        // Just because we might need it
        metadata: {
            type:       'json',
            defaultsTo: {}
        },

        /* We need this for SMS notifiers */
        mobilePhone: {
            type:       'string',
            defaultsTo: ''
        },

        /* All of these could be shoved under the data field, but this standardizes them */

        legal: {
            type:       'json',
            defaultsTo: {}
        },

        address: {
            type:       'json',
            defaultsTo: {}
        },

        demographics: {
            type:       'json',
            defaultsTo: {}
        },

        registeredAt: {
            type: 'datetime'
        },

        // User is blocked until they validate thru email or text
        // For now, not implemented
        
        ownedVenues: {
            collection: 'Venue',
            via: 'venueOwners'
        },

        managedVenues: {
            collection: 'Venue',
            via: 'venueManagers'
        },

        organization: { //only for proprietors 
            model: 'Organization'
        },

        // Turns on dev menu in the iOS/Android apps
        isDev: {
            type: 'boolean',
            defaultsTo: false
        },

        // Set for OG employees, turns on normally invisible venues, etc.
        isOG: {
            type:       'boolean',
            defaultsTo: false
        },

        uuid: {
            type: 'string'
        },
        

        toJSON: function() {

            var obj = this.toObject();
            return obj;
        }


    } ),


    // these appear to be undefined in waterlock, another fine waterlocak bug
    //beforeCreate: require( 'waterlock' ).models.user.beforeCreate,

    beforeUpdate: require( 'waterlock' ).models.user.beforeUpdate,

    beforeCreate: function ( values, cb ) {

        if ( !values.uuid ) {
            values.uuid = uuid();
        }

        cb();

    }
};
