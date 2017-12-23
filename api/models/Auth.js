/**
 * Auth
 *
 * @module      :: Model
 * @description :: Holds all authentication methods for a User
 * @docs        :: http://waterlock.ninja/documentation
 */

module.exports = {

    attributes: require( 'waterlock' ).models.auth.attributes( {

        // privilege ring. 1 is GOD, 2 device, 3 user, 4 user+advert
        ring: {
            type: 'integer',
            required: true,
            defaultsTo: 3
        },

        smsCode: {
            type: 'string',
            defaultsTo: ''

        },

        smsValidated: {
            type: 'boolean',
            defaultsTo: false
        },

        toJSON: function () {
            var obj = this.toObject();
            delete obj.password;
            return obj;
        }


    } ),

    beforeCreate: require( 'waterlock' ).models.auth.beforeCreate,
    beforeUpdate: require( 'waterlock' ).models.auth.beforeUpdate,

    afterUpdate: function ( updatedRecord, cb ) {

        // If the reg code is set, put a timeout to clear it in 5 minutes
        if ( updatedRecord.smsCode ) {
            setTimeout( function () {
                Auth.update( { id: updatedRecord.id }, { smsCode: '' } )
                    .then( function ( dev ) {
                        sails.log.silly( "Cleared sms reg code" );
                    } )
            }, 1 * 60 * 1000 );
        }

        cb();
    },
};
