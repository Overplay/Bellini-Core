/**
 * VenueController
 *
 * @description :: Server-side logic for managing venues
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var Yelp = require('yelp');

var yelp = new Yelp({
    consumer_key: "BAos8_zEjNvVuptYHO8tyA",
    consumer_secret: "lU4QHPKu7XdO-8IRIdH-1gpgWxg",
    token: "4zCE_xN7zdbdrGgxiM-_kuFER25FWLEh",
    token_secret: "WLHkoScUyrkJCW1WS7c_fXe_ekI"
})

module.exports = {

    addVenue: function (req, res) {

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


        Venue.create(newVenue)
            .then(function (v) {
                //TODO test venue owners
                v.venueOwners.add(req.session.user);
                v.save();
                sails.log.debug("venue ownership", v)
                return res.json(v);
            })
            .catch(function (err) {
                return res.serverError(err); //give out error (will only show error info if not in production) 
            })
    },

    getVenueManagers: function (req, res) {
        if (!req.session || !req.session.user) {
            return res.badRequest("user not logged in");
        }
        
        Venue.findOne({ id: req.allParams().id }).populate('venueManagers')
            .then( function (venue) {
                if (venue) {
                    return res.json(venue.venueManagers);
                }
            })
    },
    
    yelpSearch: function (req, res) {
        yelp.search(req.allParams())
            .then(function (data) {
                return res.json(data);
            })
    },

    yelpBusiness: function (req, res) {
        yelp.business(req.allParams().yelpId)
            .then(function (data) {
                return res.json(data);
            })
    },

    addManager: function(req, res) {
        //params : user ID , venue ID
        var params = req.allParams().params;

        //have to add proprietor.manager role to user if not already there.
        //call role cache sync
        User.findOne(params.userId)
            .populate("managedVenues")
            .then(function(user){
                if (user ) { //TODO check that user doesn't already manage venue
                    //thought - own OR manage , not both
                    user.roles = _.union(user.roles, [RoleCacheService.roleByName("proprietor", "manager")])
                    user.managedVenues.add(params.venueId)
                    user.save(function (err) {
                        if (err)
                            sails.log.debug(err)
                        Venue.findOne(params.venueId)
                            .populate("venueManagers")
                            .populate("venueOwners")
                            .then(function(venue){
                                return res.json(venue)

                            })
                    })
                }
                else
                    return res.badRequest("invalid user id")
            })
    }
};

