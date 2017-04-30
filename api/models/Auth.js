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

        toJSON: function () {
            var obj = this.toObject();
            delete obj.password;
            return obj;
        }


    } ),

    beforeCreate: require( 'waterlock' ).models.auth.beforeCreate,
    beforeUpdate: require( 'waterlock' ).models.auth.beforeUpdate
};
