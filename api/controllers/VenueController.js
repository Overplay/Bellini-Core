/**
 * VenueController
 *
 * @description :: Server-side logic for managing venues
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var yelp = require( 'yelp-fusion' );
var _ = require( 'lodash' );
var Promise = require( 'bluebird' );

var client;

yelp.accessToken( "CHNAkuUQFFBtEFoNMUPM1Q", "eT1w1XHbuZ2wEh3Bqqd1Qy5SfwLcaDXapAKrIN6BEfS81AU6U8RHLmfwpZl6Y2Sn" )
    .then( function ( response ) {
        client = yelp.client( response.jsonBody.access_token );
    } );

module.exports = {


    // creates a new venue
    // rewritten by MAK
    addVenue: function ( req, res ) {

        var params = req.allParams();

        if ( !params.address || !params.name )
            return res.badRequest( { error: "Missing params" } )

        Venue.create( params )
            .then( res.ok )
            .catch( res.serverError );

    },


    //creates a new venue
    addVenueOldAndBroken: function ( req, res ) {

        var params = req.allParams();

        if ( !params.address || !params.name )
            return res.badRequest( { error: "Missing params" } )

        if ( !params.id && !(req.session && req.session.user && req.session.user.id) )
            return res.badRequest( { error: "No user id provided and no user logged in" } );

        var id = params.id ? params.id : req.session.user.id;

        var addressUsed = true;

        //TODO fix this and figure out how to prevent duplicates
        async.whilst( function () {
                return addressUsed;
            }, function ( next ) {
                Venue.findOne( { address: req.allParams().address } )
                    .then( function ( v ) {
                        addressUsed = !!v;
                    } )
                    .catch( function ( err ) {
                        sails.log.debug( "Bad Error" );
                        addressUsed = false;
                        res.serverError( { error: err } );
                    } );

            }, function ( err ) {
            }
        );

        var newVenue = req.allParams();

        User.findOne( { id: req.session.user.id } )
            .populate( 'auth' )
            .then( function ( user ) {
                if ( user ) {
                    var auth = user.auth;
                    user.roles = _.union( user.roles, [ RoleCacheService.roleByName( "proprietor", "owner" ) ] );
                    user.save( function ( err ) {
                        if ( err ) {
                            sails.log.debug( err );
                            return res.serverError( { error: err } )
                        }
                        user.auth = auth; //save turns auth into an id
                        req.session.user = user;
                        sails.log.debug( req.session.user )
                        return Venue.create( newVenue )
                            .then( function ( v ) {
                                //TODO test venue owners
                                v.venueOwners.add( req.session.user );
                                v.save();
                                //sails.log.debug("venue ownership", v)
                                return res.json( { venue: v, user: user } )
                            } )

                    } );
                }
            } )
            .catch( function ( err ) {
                return res.serverError( { error: err } ); //give out error (will only show error info if not in
                                                          // production)
            } )


    },

    getVenueManagers: function ( req, res ) {

        if ( !req.allParams().id )
            return res.badRequest( { error: "No venue id specified" } );

        Venue.findOne( { id: req.allParams().id } ).populate( 'venueManagers' )
            .then( function ( venue ) {
                if ( venue ) {
                    return res.ok( venue.venueManagers );
                }
                else
                    return res.badRequest( { error: "Invalid Venue ID" } );
            } )
            .catch( function ( err ) {
                return res.serverError( { error: err } )
            } )
    },

    yelpSearch: function ( req, res ) {
        client.search( req.allParams() )
            .then( function ( data ) {
                res.ok( data.body );
            } )
            .catch( res.serverError )
    },

    yelpBusiness: function ( req, res ) {
        client.business( req.allParams().yelpId )
            .then( res.ok )
            .catch( res.serverError )
    },

    queryName: function ( req, res ) {

        var params = req.allParams();

        if ( !params.query )
            return res.badRequest( { error: "No query provided" } );

        var query = params.query;
        var venues = [];
        var chain = Promise.resolve();

        chain = chain.then( function () {
            return Venue.find(
                {
                    where: {
                        name: { 'contains': query }
                    },
                    limit: 10
                } )
                .then( function ( venueList ) {
                    venues = venueList;
                } )
                .catch( function ( err ) {
                    sails.log.debug( err );
                    res.serverError( { error: err } );
                } )
                .then( function () {
                    res.ok( venues );
                } )
        } )

        return chain;

    },


    // TODO there is a lot of replicated code beteeen add manager and add owner (MAK 4-17)
    addManager: function ( req, res ) {
        //params : user ID , venue ID
        var params = req.allParams();

        if ( !params.id )
            return res.badRequest( { error: "Missing params" } );

        //have to add proprietor.manager role to user if not already there.
        User.findOne( params.userId )
            .populate( "auth" )
            .populate( "managedVenues" )
            .populate( "ownedVenues" )
            .then( function ( user ) {
                if ( user ) { //TODO check that user doesn't already manage venue
                    if ( _.find( user.managedVenues, function ( v ) {
                            return v.id == params.id
                        } )
                        || _.find( user.ownedVenues, function ( v ) {
                            return v.id == params.id
                        } ) ) {
                        return res.ok();
                    }
                    else {
                        //thought - own OR manage , not both
//                        if (user.auth.ring > 2) {
//                            user.auth.ring = 2;
//                            user.auth.save();
//                        }
                        user.managedVenues.add( params.id )
                        user.save( function ( err ) {
                            if ( err ) {
                                sails.log.debug( err )
                                return res.serverError( { error: err } )
                            }
                            return Venue.findOne( params.id )
                                .populate( "venueManagers" )
                                .then( function ( venue ) {
                                    return res.ok( venue.venueManagers )

                                } )
                        } )
                    }
                }
                else
                    return res.badRequest( { error: "invalid user id" } )
            } )
    },

    /*Add and remove owner/manager of the venue
     *does this so the join table is altered for the many to many relationship
     * also changes the roles of the user!
     */
    addOwner: function ( req, res ) {
        //params : user ID , venue ID (id)
        var params = req.allParams();

        if ( !params.id )
            return res.badRequest( { error: "Missing params" } );

        //have to add proprietor.owner role to user if not already there.
        User.findOne( params.userId )
            .populate( "auth" )
            .populate( "managedVenues" )
            .populate( "ownedVenues" )
            .then( function ( user ) {
                if ( user ) { //TODO check that user doesn't already manage venue
                    if ( _.find( user.managedVenues, function ( v ) {
                            return v.id == params.id
                        } )
                        || _.find( user.ownedVenues, function ( v ) {
                            return v.id == params.id
                        } ) ) {
                        return res.ok();
                    }
                    else {
                        //thought - own OR manage , not both
//                        if (user.auth.ring > 2) {
//                            user.auth.ring = 2;
//                            user.auth.save();
//                        }
                        user.ownedVenues.add( params.id )
                        user.save( function ( err ) {
                            if ( err )
                                sails.log.debug( err )
                            Venue.findOne( params.id )
                                .populate( "venueOwners" )
                                .then( function ( venue ) {
                                    return res.ok( venue.venueOwners )

                                } )
                                .catch( function ( err ) {
                                    return res.serverError( { error: err } );
                                } )
                        } )
                    }
                }
                else
                    return res.badRequest( { error: "invalid user id" } )
            } )
            .catch( function ( err ) {
                return res.serverError( { error: err } ); //give out error (will only show error info if not in
                                                          // production)
            } )
    },

    removeManager: function ( req, res ) {
        var params = req.allParams();
        //params : user ID , venue ID is id

        if ( !params.id )
            return res.badRequest( { error: "Missing params" } );

        //have to remove from many to many and possibly role
        User.findOne( params.userId )
            .populate( "auth" )
            .populate( "managedVenues" )
            .populate( "ownedVenues" )
            .then( function ( user ) {
                if ( user ) {

                    //remove their role as a manager if they are no longer managing any venues
//                    if ( user.managedVenues.length < 2 ) {
//                        user.auth.ring = 3;
//                        user.auth.save();
//                    }

                    user.managedVenues.remove( params.id )
                    user.save( function ( err ) {
                        if ( err ) {
                            sails.log.debug( err )
                            return res.serverError( { error: err } )
                        }
                        return Venue.findOne( params.id )
                            .populate( "venueManagers" )
                            .then( function ( venue ) {
                                return res.ok( venue.venueManagers )

                            } )
                            .catch( function ( err ) {
                                return res.serverError( { error: err } )
                            } )
                    } )
                }

                else
                    return res.badRequest( { error: "invalid user id" } )
            } )
            .catch( function ( err ) {
                return res.serverError( { error: err } ); //give out error (will only show error info if not in
                                                          // production)
            } )


    },
    removeOwner:   function ( req, res ) {
        var params = req.allParams();
        //params : user ID , venue ID

        if ( !params.id )
            return res.badRequest( { error: "Missing params" } );

        //prevent self removal from venue owner
        if ( params.userId === req.session.user.id ) {
            return res.badRequest( { error: "Cannot remove self from owning venue" } )
        }

        var chain = Promise.resolve()
        var venue = {};

        chain = chain.then( function () {
            return Venue.findOne( params.id )
                .populate( "venueOwners" )
                .then( function ( v ) {
                    if ( v ) {
                        if ( v.venueOwners.length < 2 )
                            return res.badRequest( { error: "Venue only has one owner. Cannot remove them" } )
                    }

                    else
                        return res.badRequest( { error: "Venue does not exist " } )
                } )

        } )

        //have to remove from many to many and possibly role
        chain
            .then( function ( r ) {
                if ( !r ) {
                    return User.findOne( params.userId )
                        .populate( "managedVenues" )
                        .populate( "ownedVenues" )
                        .then( function ( user ) {
                            if ( user ) {

                                //remove their role as a manager if they are no longer managing any venues
//                                if ( user.ownedVenues.length < 2 ) {
//                                    user.auth.ring = 3;
//                                    user.auth.save();
//
//                                }

                                user.ownedVenues.remove( params.id )
                                user.save( function ( err ) {
                                    if ( err ) {
                                        sails.log.debug( err )
                                        return res.serverError( { error: err } )
                                    }
                                    return Venue.findOne( params.id )
                                        .populate( "venueOwners" )
                                        .then( function ( venue ) {
                                            return res.ok( venue.venueOwners )

                                        } )
                                } )
                            }

                            else
                                return res.badRequest( { error: "invalid user id" } )
                        } )
                }


            } )
            .catch( function ( err ) {
                return res.serverError( { error: err } ); //give out error (will only show error info if not in
                                                          // production)
            } )


    },

    getMobileView: function ( req, res ) {
        Venue.find( { showInMobileAppMap: true } )
            .then( function ( venues ) {
                return res.ok( venues )
            } )
            .catch( function ( err ) {
                return res.serverError( { error: err } )
            } )
    },

    // Added by Mitch

    myvenues: function ( req, res ) {
        // GET check handled in policies MAK 5-2017

        var thisUser = PolicyService.getUserForReq( req );

        if ( !thisUser )
            return res.badRequest( { error: 'There is no user for the session' } );

        User.findOne( thisUser.id )
            .populate( [ 'managedVenues', 'ownedVenues' ] )
            .then( function ( user ) {
                if ( !user ) {
                    return res.badRequest( { error: 'This one is weird. The user for this session does not exist. Database inconsistency?' } );
                }

               return res.ok( { owned: user.ownedVenues, managed: user.managedVenues } );

            } )
            .catch( res.serverError );

    },

    // myvenuesandpatrons: function(req, res){
    //
    //     var thisUser = PolicyService.getUserForReq( req );
    //
    //     if ( !thisUser )
    //         return res.badRequest( { error: 'There is no user for the session' } );
    //
    //     User.findOne( thisUser.id )
    //         .populate( [ 'managedVenues', 'ownedVenues' ] )
    //         .then( function ( user ) {
    //             if ( !user ) {
    //                 var e = new Error( 'This one is weird. The user for this session does not exist. Database inconsistency?' );
    //                 e.res = res.serverError;
    //                 throw e;
    //             }
    //             // Yeah, this is some hairy promise shit right here, y'all
    //             return Promise.props({
    //                 owned: user.ownedVenues,
    //                 managed: user.managedVenues,
    //                 ownedPatrons: Promise.all(user.ownedVenues.map(function(v){ return UserInteraction.find( { venueUUID: v.uuid } )})),
    //                 managedPatrons: Promise.all( user.managedVenues.map( function ( v ) { return UserInteraction.find( { venueUUID: v.uuid } )} ) )
    //             });
    //         } )
    //         .then( function(props){
    //             return res.ok(props);
    //         })
    //         .catch( cascadeError );
    //
    //
    //     UserInteraction.find( { venueUUID: venueUUID } )
    //         .then( function ( interactions ) {
    //             if ( !interactions ) {
    //                 return res.ok( [] );
    //             }
    //
    //             var userIds = _( interactions ).uniqBy( 'userId' ).map( 'userId' ).value();
    //             return User.find( { id: userIds } ).populate( [ 'auth' ] );
    //
    //         } )
    //
    // },

    // replaces blueprint, easier to secure
    all: function ( req, res ) {

        if ( req.method != 'GET' )
            return res.badRequest( { error: "Bad Verb" } );

        // With an existing database this is an ass-painer becuase some have virtual as undefined
        // var query = { virtual: false };
        // if ( req.allParams().virtual && req.allParams().virtual==true ){
        //     query = {}
        // }

        Venue.find( { virtual: false } )
            .then( res.ok )
            .catch( res.serverError );

    },

    findByUUID: function ( req, res ) {

        if ( req.method != 'GET' )
            return res.badRequest( { error: "Bad Verb" } );

        //OK, we need a venueId
        var params = req.allParams();

        if ( !params.id && !params.uuid )
            return res.badRequest( { error: "Missing uuid" } );

        var includeVirtual = !!params.includeVirtual;

        var uuid = params.id || params.uuid;

        var query = includeVirtual ? { uuid: uuid } : { uuid: uuid, virtual: false };

        Venue.findOne( query )
            .then( function ( venue ) {

                if ( !venue ) {
                    return res.notFound( { error: "no venue with that UUID" } );
                }

                return res.ok( venue );
            } )
            .catch( res.serverError );

    },

    geocode: function ( req, res ) {

        if ( req.method != 'GET' )
            return res.badRequest( { error: "Bad Verb" } );

        //OK, we need a venueId
        var params = req.allParams();

        if ( !params.address )
            return res.badRequest( { error: "address" } );


        GeocodeService.geocode( params.address )
            .then( function ( results ) {
                if ( !results.length ) {
                    sails.log.silly( "Bad geocode result!" );
                    return res.badRequest( { error: 'no result' } )
                }

                sails.log.silly( "Geocode returned this many hits: " + results.length );
                return res.ok( results );
            } )
            .catch( function ( err ) {
                return res.badRequest( err );
            } )

    },

    create: function ( req, res ) {

        var thisUser = PolicyService.getUserForReq( req );

        if ( !thisUser )
            return res.badRequest( { error: 'There is no user for the session' } );

        var params = req.allParams();

        Venue.create( params )
            .then( function ( venue ) {
                venue.venueOwners.add( thisUser.id );
                return Promise.props( { venue: venue, save: venue.save() } );
            } )
            .then( function ( props ) {
                return res.ok( props.venue );
            } )
            .catch(res.serverError);

    },

    getVenueAds: function ( req, res ) {

        if (req.method !== 'GET')
            return res.badRequest("Wrong verb");

        if (!req.allParams().id)
            return res.badRequest("No venue id");

        Venue.findOne(req.allParams().id)
            .then( function (venue) {
                if (!venue)
                    return res.notFound();

                return venue.sponsorships;
            })
            .then( function (ads) {
                return Ad.find(ads)
            })
            .then( function (ads) {
                res.ok(ads);
            })
    }
};

