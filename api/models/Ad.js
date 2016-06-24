/**
 * Advertisement.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {
        name: {
            type: 'string'
        },
        description: {
            type: 'string'
        },
        creator: {
            model: 'User'
        },
        /* media: { //TODO might be array at some point
            collection: 'Media',
            via: 'advertisement'
         },*/
         
         //TODO, Cole: use a more descriptive name
        marr: {
            type: 'array',
            defaultsTo: []
        }


    }
};

