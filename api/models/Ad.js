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
        text: { //TODO limit length of strings and array
            type: 'array',
            defaultsTo: ['', '', ''] 

        },
        images: { //front end has to set sizes for images
            type: 'json',
            defaultsTo: {
                widget: null,
                crawler: null
            }
        },
        paused: {
            type: 'boolean',
            defaultsTo: false
        },
        reviewed: {
            type: 'boolean',
            defaultsTo: false
        },
        accepted: {
            type: 'boolean',
            defaultsTo: false
        },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        },
        metaData: {
            type: 'json',
            defaultsTo: {}
        }
        /*venueList: { //array of venue Ids where it has been shown
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

         },
         reviewed: {
         type:boolean,
         defaultsTo: false
         }
         */


    },

    afterCreate: function (values, cb) {
        //TODO send email to admin'
        MailingService.adReviewNotification("EMAIL"); //TODO email lol
        cb();
    },

    //TODO handle this only when a user is updating and not when admin is doing it - maybe move to controller on the updating end? idk
    /*afterUpdate: function(values, cb){
     //TODO send email to admin'
     MailingService.adReviewNotification("EMAIL"); //TODO email lol
     cb();
     }*/
};

