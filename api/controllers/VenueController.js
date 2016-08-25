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


    //creates a new venue
    addVenue: function (req, res) {

        var params = req.allParams();

        if (!params.address || !params.name)
            res.badRequest("Missing params")

        if (!params.id && !(req.session && req.session.user && req.session.user.id))
            res.badRequest("No user id provided and no user logged in");

        var id = params.id ? params.id : req.session.user.id;

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
                        res.serverError(err);
                    });

            }, function (err) {
            }
        );

        var newVenue = req.allParams();

        User.findOne({id: req.session.user.id})
            .populate('auth')
            .then( function (user) {
                if (user) {
                    var auth = user.auth;
                    user.roles = _.union(user.roles, [RoleCacheService.roleByName("proprietor", "owner")]);
                    user.save(function (err) {
                        if (err)
                            sails.log.debug(err);
                        user.auth = auth; //save turns auth into an id
                        req.session.user = user;
                        sails.log.debug(req.session.user)
                        Venue.create(newVenue)
                            .then(function (v) {
                                //TODO test venue owners
                                v.venueOwners.add(req.session.user);
                                v.save();
                                //sails.log.debug("venue ownership", v)
                                return res.json({ venue: v, user: user })
                            })
                            .catch(function (err) {
                                return res.serverError(err); //give out error (will only show error info if not in production)
                            })
                    });
                }
            })


    },

    getVenueManagers: function (req, res) {

        if (!req.allParams().id)
            res.badRequest("No venue id specified");

        Venue.findOne({ id: req.allParams().id }).populate('venueManagers')
            .then( function (venue) {
                if (venue) {
                    return res.ok(venue.venueManagers);
                }
                else
                    return res.badRequest();
            })
            .catch(function (err) {
                return res.serverError(err)
            })
    },
    
    yelpSearch: function (req, res) {
        yelp.search(req.allParams())
            .then(function (data) {
                res.ok(data);
            })
            .catch( function (err) {
                res.serverError(err);
            })
    },

    yelpBusiness: function (req, res) {
        yelp.business(req.allParams().yelpId)
            .then(function (data) {
                res.ok(data);
            })
    },

    queryName: function (req, res) {

        var params = req.allParams();

        if (!params.query)
            res.badRequest("No query provided");

        var query = params.query;
        var venues = [];
        var chain = Promise.resolve();

        chain = chain.then( function() {
            return Venue.find(
                {
                    where: {
                        name: {'contains' : query}
                    },
                    limit: 10
                })
                .then( function (venueList) {
                    venues = venueList;
                })
                .catch( function (err) {
                    sails.log.debug(err);
                    res.serverError(err);
                })
                .then( function () {
                    res.ok(venues);
                })
        })

    },

    addManager: function (req, res) {
        //params : user ID , venue ID
        var params = req.allParams();

        if (!params.id)
            res.badRequest("Missing params");

        //have to add proprietor.manager role to user if not already there.
        User.findOne(params.userId)
            .populate("managedVenues")
            .populate("ownedVenues")
            .then(function (user) {
                if (user) { //TODO check that user doesn't already manage venue
                    if (_.find(user.managedVenues, function (v) {
                            return v.id == params.id
                        })
                        || _.find(user.ownedVenues, function (v) {
                            return v.id == params.id
                        })) {
                        return res.ok();
                    }
                    else {
                        //thought - own OR manage , not both
                        user.roles = _.union(user.roles, [RoleCacheService.roleByName("proprietor", "manager")])
                        user.managedVenues.add(params.id)
                        user.save(function (err) {
                            if (err)
                                sails.log.debug(err)
                            Venue.findOne(params.id)
                                .populate("venueManagers")
                                .then(function (venue) {
                                    return res.ok(venue.venueManagers)

                                })
                        })
                    }
                }
                else
                    return res.badRequest("invalid user id")
            })
    },

    /*Add and remove owner/manager of the venue
    *does this so the join table is altered for the many to many relationship
    * also changes the roles of the user! 
     */
    addOwner: function (req, res) {
        //params : user ID , venue ID (id)
        var params = req.allParams();

        if (!params.id)
            res.badRequest("Missing params");

        //have to add proprietor.owner role to user if not already there.
        User.findOne(params.userId)
            .populate("managedVenues")
            .populate("ownedVenues")
            .then(function (user) {
                if (user) { //TODO check that user doesn't already manage venue
                    if (_.find(user.managedVenues, function (v) {
                            return v.id == params.id
                        })
                        || _.find(user.ownedVenues, function (v) {
                            return v.id == params.id
                        })) {
                        return res.ok();
                    }
                    else {
                        //thought - own OR manage , not both
                        user.roles = _.union(user.roles, [RoleCacheService.roleByName("proprietor", "owner")])
                        user.ownedVenues.add(params.id)
                        user.save(function (err) {
                            if (err)
                                sails.log.debug(err)
                            Venue.findOne(params.id)
                                .populate("venueOwners")
                                .then(function (venue) {
                                    return res.ok(venue.venueOwners)

                                })
                        })
                    }
                }
                else
                    return res.badRequest("invalid user id")
            })
    },

    removeManager: function (req, res) {
        var params = req.allParams();
        //params : user ID , venue ID is id

        if (!params.id)
            res.badRequest("Missing params");

        //have to remove from many to many and possibly role
        User.findOne(params.userId)
            .populate("managedVenues")
            .populate("ownedVenues")
            .then(function (user) {
                if (user) {

                    //remove their role as a manager if they are no longer managing any venues
                    if (user.managedVenues.length < 2) {
                        _.remove(user.roles, function (r) {
                            return r == RoleCacheService.roleByName("proprietor", "manager")
                        })

                    }

                    user.managedVenues.remove(params.id)
                    user.save(function (err) {
                        if (err)
                            sails.log.debug(err)
                        Venue.findOne(params.id)
                            .populate("venueManagers")
                            .then(function (venue) {
                                return res.ok(venue.venueManagers)

                            })
                    })
                }

                else
                    return res.badRequest("invalid user id")
            })


    },
    removeOwner: function (req, res) {
        var params = req.allParams();
        //params : user ID , venue ID

        if (!params.id)
            res.badRequest("Missing params");

        //prevent self removal from venue owner
        if (params.userId == req.session.user.id) {
            return res.badRequest("Cannot remove self from owning venue")
        }

        var chain = Promise.resolve()
        var venue = {};

        chain = chain.then(function () {
            return Venue.findOne(params.id)
                .populate("venueOwners")
                .then(function (v) {
                    if (v) {
                        if (v.venueOwners.length < 2)
                            return res.badRequest("Venue only has one owner. Cannot remove them")
                    }

                    else
                        return res.badRequest("Venue does not exist ")
                })

        })

        //have to remove from many to many and possibly role
        chain.then(function (r) {
            if (!r) {
                return User.findOne(params.userId)
                    .populate("managedVenues")
                    .populate("ownedVenues")
                    .then(function (user) {
                        if (user) {

                            //remove their role as a manager if they are no longer managing any venues
                            if (user.ownedVenues.length < 2) {
                                _.remove(user.roles, function (r) {
                                    return r == RoleCacheService.roleByName("proprietor", "owner")
                                })

                            }

                            user.ownedVenues.remove(params.id)
                            user.save(function (err) {
                                if (err)
                                    sails.log.debug(err)
                                Venue.findOne(params.id)
                                    .populate("venueOwners")
                                    .then(function (venue) {
                                        return res.ok(venue.venueOwners)

                                    })
                            })
                        }

                        else
                            return res.badRequest("invalid user id")
                    })
            }


        })


    },

    getMobileView: function (req, res) {
        Venue.find({showInMobileAppMap: true})
            .then(function (venues) {
                return res.ok(venues)
            })
    }
};

