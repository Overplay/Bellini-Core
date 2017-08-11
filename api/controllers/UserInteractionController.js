/**
 * UserInteractionController
 *
 * @description :: Server-side logic for managing Userinteractions
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

 var _ = require('lodash');

module.exports = {


    // atvenue: function ( req, res ) {
    //
    //     // GET check handled in policies MAK 5-2017
    //
    //     var venueUUID = params.allParams().venueUUID;
    //     if (!venueUUID){
    //         return res.badRequest({error: 'No venueUUID'});
    //     }
    //
    //     UserInteraction.find( { venueId: venueUUID })
    //         .then( res.ok )
    //         .catch( res.serverError);
    //
    // },

    patronsForVenue: function ( req, res ) {

        // GET check handled in policies MAK 5-2017

        var venueUUID = req.allParams().venueUUID;
        if (!venueUUID){
            return res.badRequest({error: 'No venueUUID'});
        }

        UserInteraction.find( { venueUUID: venueUUID })
            .then( function(interactions){
                if (!interactions){
                   return res.ok([]);
                }

                var userIds = _(interactions).uniqBy('userId').map('userId').value();
                return User.find( { id: userIds }).populate(['auth']);

            })
            .then( res.ok )
            .catch( res.serverError);

    },

};

