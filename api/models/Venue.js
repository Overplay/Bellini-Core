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
      type: 'collection',
      via: 'venue'
    },

    venueOwner: {
      model: 'User'
    }

  }
};

