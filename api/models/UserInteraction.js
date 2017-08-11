/**
 * UserInteraction.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

      userId: {
          type:     'string',
          required: true
      },

      venueUUID: {
          type: 'string'
      },

      deviceUDID: {
          type: 'string'
      },

      interaction: {
          type:     'string',
          required: true
      },

      meta: {
          type: 'json'
      }

  }
};

