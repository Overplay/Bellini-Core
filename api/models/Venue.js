/**
 * Venue.js
 *
 * @description :: Venue where devices are managed. Eventually will reference Organization.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    address: {
      type: 'json'
    },

    devices: {
      collection: 'Device',
      via: 'venue'
    },

    venueOwner: {
      model: 'User'
    }

  }
};

