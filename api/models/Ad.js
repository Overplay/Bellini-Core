/**
 * Ad.js
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
        images: { //maybe turn into json with a sm, med, lg, wide etc for ids 
            type: 'json',
            defaultsTo: {
                sm: null,
                md: null,
                lg: null,
                wide: null
            }
        },
        accepted: {
            type: 'boolean',
            defaultsTo: false
        },
        venueList: { //array of venue Ids where it has been shown
            type: 'array',
            defaultsTo: []
        },
        timesShown: {
            type: 'integer',
            defaultsTo: 0
        },
        /*screenTime: { //future hopefuls
         type: 'integer',
         defaultsTo: 0
         },
         metadata: {
         type: 'json',
         defaultsTo: {}

         }*/


    }
};

