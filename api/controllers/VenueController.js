/**
 * VenueController
 *
 * @description :: Server-side logic for managing venues
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	
    addVenue: function(req, res) {

        //check req session and user 
        if (!req.session || !req.session.user) {
            return res.badRequest("user not logged in");

        }

        var addressUsed = true;

        //TODO fix this and figure out how to prevent duplicates
        async.whilst(function () {
                return addressUsed;
            }, function (next) {
                Venue.findOne({address: req.allParams().address})
                    .then(function (v) {
                        addressUsed = !!v;
                    })
                    .catch(function (err) {
                        sails.log.debug("Bad Error");
                        addressUsed = false;
                        res.notFound("something very wrong happened");
                    });

            }, function (err) {
            }
        );

        var newVenue = req.allParams();

        newVenue.venueOwner = req.session.user; //link user to venue being created

        Venue.create(newVenue)
            .then(function (v) {
                return res.json(newVenue);
            })
            .catch(function (err) {
                return res.serverError(err); //give out error (will only show error info if not in production) 
            })
    }
};

