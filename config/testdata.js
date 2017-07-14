/**
 * Created by rhartzell on 5/6/16.
 */

    //Note: test data will be duplicated if being run on a cluster!
var moment = require( 'moment' )
var Promise = require( 'bluebird' );

var fs = require( 'fs-extra' );
var path = require( 'path' );
var _ = require( 'lodash' );


/**
 * If shouldWipe is true, returns a promise to wipe everything
 * otherwise returns resolved Promise that does nothing.
 * @param shouldWipe
 * @returns {*}
 */
function wipeAllData(shouldWipe){

    if (shouldWipe){

        sails.log.debug( "Erasing old test data installation." );

        var destruct = [
            Auth.destroy( {} ),
            User.destroy( {} ),
            Venue.destroy( {} ),
            Media.destroy( {} ),
            Ad.destroy( {} )
        ];

        return Promise.all(destruct);

    }

    sails.log.debug( "Leaving DB intact." );
    return Promise.resolve(); //nothing burger
}


var self = module.exports.testdata = {

    installTestData: true,
    eraseOldData:    false,

    install: function () {



        var chain = wipeAllData(self.eraseOldData);


        self.users.forEach( function ( u ) {

            // if (u.organizationEmail) {
            //     var organizationEmail = u.organizationEmail;
            //     chain = chain.then(function () {
            //         return Organization.findOne({email: organizationEmail})
            //             .then(function (o) {
            //                 u.organization = o;
            //             })
            //     })
            //     delete u.organizationEmail;
            // }
            chain = chain.then( function () {
                return AdminService.addUserAtRing( u.email, u.password, u.ring,
                    { firstName: u.firstName, lastName: u.lastName }, false )
                    .then( function () { sails.log.debug( "User created." )} )
                    .catch( function () { sails.log.warn( "User NOT created. Probably already existed." )} );
            } )
        } );


        self.venues.forEach( function ( v ) {

            var ownerEmails = v.ownerEmails;
            var managerEmails = v.managerEmails;
            delete v.ownerEmails;
            delete v.managerEmails;
            var venueOwners = [];
            var venueManagers = [];

            if ( v.organizationEmail ) {
                var organizationEmail = v.organizationEmail;
                chain = chain.then( function () {
                    return Organization.findOne( { email: organizationEmail } )
                        .then( function ( o ) {
                            v.organization = o;
                        } )
                } )
                delete v.organizationEmail;
            }

            managerEmails.forEach( function ( manager ) {
                chain = chain.then( function () {
                    return Auth.findOne( { email: manager } )
                        .then( function ( user ) {
                            venueManagers.push( user.user );
                        } )
                } )
            } )

            ownerEmails.forEach( function ( owner ) {
                chain = chain.then( function () {
                    return Auth.findOne( { email: owner } )
                        .then( function ( user ) {
                            venueOwners.push( user.user );
                        } )
                } )
            } )

            // chain = chain.then(function () {
            //     return Auth.findOne({email: ownerEmails[0]}) //dumb fix
            chain = chain.then( function ( user ) {
                //v.venueOwners.push(user.user);
                //sails.log.debug(venueManagers)
                return Venue.findOne( { uuid: v.uuid } )
                    .then( function ( ven ) {
                        //sails.log.debug(ven);
                        if ( ven ) {
                            sails.log.debug( "Venue exists" )
                            return new Error( "Venue Exists, skipping creation" )
                        }
                        else {
                            return Venue.create( v )

                                .then( function ( newV ) {
                                    //sails.log(newV)
                                    //sails.log(venueManagers)
                                    //sails.log(venueOwners)
                                    newV.venueOwners.add( venueOwners )
                                    newV.save( { populate: false }, function ( err ) {
                                        if ( err ) sails.log.debug( err )
                                    } );
                                    newV.venueManagers.add( venueManagers )
                                    newV.save( { populate: false }, function ( err ) {
                                        if ( err ) sails.log.debug( err )
                                    } );

                                    sails.log.debug( "Venue created with name " + newV.name );
                                } )
                                .catch( function ( err ) {
                                    sails.log.debug( err )
                                } )
                        }

                    } )
                    .catch( function ( err ) {
                        sails.log.debug( err )
                    } )

            } )
            // })

        } );

        self.advertisements.forEach( function ( ad ) {

            if ( ad.images ) {

                var adImage256 = path.normalize( __dirname + '/../assets/testdata/adverts/' + ad.images.widget );
                // check if this image is in Media, if so, assume the whole Advert has been installed and bail
                Media.findOne( { path: adImage256 } )
                    .then( function ( media ) {

                        if ( !media ) {
                            sails.log.silly( "Media for ad " + ad.name + " does not exist, installing ad." );
                            return Promise.props(
                                {
                                    widget:  Media.create( {
                                        path:   adImage256,
                                        source: 'ad install'
                                    } ),
                                    crawler: Media.create( {
                                        path:   path.normalize( __dirname + '/../assets/testdata/adverts/' + ad.images.crawler ),
                                        source: 'ad install'
                                    } ),
                                    user:    Auth.findOne( { email: ad.creatorEmail } )
                                }
                            );

                        } else {
                            sails.log.silly( "Looks like ad " + ad.name + " is already installed, skipping" );
                            // return empty resolutions
                            return Promise.props( { skip: Promise.resolve( '' ) } );
                        }

                    } )
                    .then( function ( media ) {

                        if ( media.hasOwnProperty( 'skip' ) ) {
                            return;
                        }

                        return Ad.create( {
                            name:        ad.name,
                            description: ad.description,
                            creator:     ad.user,
                            reviewState: ad.reviewState,
                            advert:      {
                                type:  '2g3s',
                                media: {
                                    crawler: media.crawler, widget: media.widget
                                },
                                text:  ad.messages
                            }
                        } )

                    } )
                    .then( function ( newAd ) {
                        if ( !newAd ) {
                            sails.log.silly( '>>>> AD NOT CREATED (it may already exist)' );
                        } else {
                            sails.log.silly( '>>>> AD INSERTED for: ' + newAd.name );
                        }

                    } )
                    .catch( function ( err ) {
                        sails.log.error( "Add insert chain failure: " + err.message );
                    } )

            } else {
                sails.log.silly( "Skipping ad, no images" );
            }

        } );
    },

    users:  [
        {
            firstName: 'Ryan',
            lastName:  'Smith',
            email:     'ryan@test.com',
            password:  'pa$$word',
            ring:      3
        },
        {
            firstName: 'Vid',
            lastName:  'Baum',
            email:     'vid@test.com',
            password:  'pa$$word',
            ring:      3
        },
        {
            firstName: 'Silvanus',
            lastName:  'Conner',
            email:     'silvanus@test.com',
            password:  'pa$$word',
            ring:      3
        },
        {
            firstName: 'Kajetan',
            lastName:  'McNeil',
            email:     'kajetan@test.com',
            password:  'pa$$word',
            ring:      3
        },
        {
            firstName: 'John',
            lastName:  'Alfredson',
            email:     'john@test.com',
            password:  'pa$$word',
            ring:      3
        },
        {
            firstName: 'Antonina',
            lastName:  'Burton',
            email:     'antonina@test.com',
            password:  'pa$$word',
            ring:      3
        },
        {
            firstName: 'Caterina',
            lastName:  'Cvetkov',
            email:     'caterina@test.com',
            password:  'pa$$word',
            ring:      3
        },
        {
            firstName: 'Joe',
            lastName:  'Rogers',
            email:     'joe@test.com',
            password:  'pa$$word',
            ring:      3
        },
        {
            firstName: 'Jerref',
            lastName:  'Gardiner',
            email:     'jerref@test.com',
            password:  'pa$$word',
            ring:      3
        },
        {
            firstName: 'Carina',
            lastName:  'Fay',
            email:     'carina@test.com',
            password:  'pa$$word',
            ring:      3
        },
        {
            firstName: 'Nereus',
            lastName:  'Macar',
            email:     'nereus@test.com',
            password:  'pa$$word',
            ring:      3
        },
        {
            firstName: 'Abel',
            lastName:  'Filipovic',
            email:     'abel@test.com',
            password:  'pa$$word',
            ring:      3
        },
        {
            firstName: 'Patricia',
            lastName:  'Jarrett',
            email:     'patricia@test.com',
            password:  'pa$$word',
            ring:      3
        },
        {
            firstName: 'Unice',
            lastName:  'Ashley',
            email:     'unice@test.com',
            password:  'pa$$word',
            ring:      3
        },
        {
            firstName: 'Paulene',
            lastName:  'Vogel',
            email:     'vogel@test.com',
            password:  'pa$$word',
            ring:      3
        },
        {
            firstName: 'Sloane',
            lastName:  'Irwin',
            email:     'sloane@test.com',
            password:  'pa$$word',
            ring:      3
        },
        {
            firstName: 'Lon',
            lastName:  'Plaskett',
            email:     'lon@test.com',
            password:  'pa$$word',
            ring:      3
        },
        {
            firstName: 'Annegret',
            lastName:  'Henderson',
            email:     'annegret@test.com',
            password:  'pa$$word',
            ring:      3

        },
        {
            firstName: 'Henderson',
            lastName:  'Reed',
            email:     'hend@test.com',
            password:  'pa$$word',
            ring:      3
        },
        {
            firstName: 'Elizabeth',
            lastName:  'Salas',
            email:     'elizabeth@test.com',
            password:  'pa$$word',
            ring:      4
        },
        {
            firstName: 'Advertiser',
            lastName:  'Smith',
            email:     'ad@test.com',
            password:  'pa$$word',
            ring:      4
        },
        {
            firstName: 'Tester',
            lastName:  "O'Admin",
            email:     'admin99@test.com',
            password:  'pa$$word',
            ring:      1
        }
    ],
    venues: [
        {
            name:          "Simulation Station",
            address:       { street: "600 E Campbell Ave", city: "Campbell", state: "CA", zip: "95008" },
            ownerEmails:   [ "john@test.com" ],
            managerEmails: [ "silvanus@test.com", "jerref@test.com" ],
            uuid:          'sim-001'
        },
        {
            name:          "Blue Line Pizza",
            address:       { street: "415 E Campbell Ave", city: "Campbell", state: "CA", zip: "95008" },
            ownerEmails:   [ "john@test.com" ],
            managerEmails: [ "silvanus@test.com", "jerref@test.com" ],
            uuid:          'test-001'
        },
        {
            name:          "Ajito",
            address:       { street: "7335 Bollinger Rd", city: "Cupertino", state: "CA", zip: "95014" },
            ownerEmails:   [ "john@test.com" ],
            managerEmails: [ "silvanus@test.com", "unice@test.com" ],
            uuid:          'test-002'
        },
        {
            name:          "The Sink",
            address:       { street: "1165 13th St.", city: "Boulder", state: "CO", zip: "80302" },
            ownerEmails:   [ "vogel@test.com" ],
            managerEmails: [ "annegret@test.com", "caterina@test.com" ],
            uuid:          'test-003'
        },
        {
            name:          "B Bar & Grill",
            address:       { street: "40 E 4th St", city: "New York", state: "NY", zip: "10003" },
            ownerEmails:   [ "ryan@test.com" ],
            managerEmails: [ "unice@test.com", "jerref@test.com" ],
            uuid:          'test-004'
        },
        {
            name:              "Novo",
            address:           { street: "726 Higuera St", city: "San Luis Obispo", state: "CA", zip: "93401" },
            ownerEmails:       [ "elizabeth@test.com" ],
            organizationEmail: "dr@test.com",
            managerEmails:     [ "caterina@test.com", "annegret@test.com", "silvanus@test.com" ],
            uuid:              'test-005'
        },
        {
            name:              "Not Your Average Joe's",
            address:           { street: "305 Main St", city: "Acton", state: "MA", zip: "01720" },
            ownerEmails:       [ "elizabeth@test.com" ],
            organizationEmail: "dr@test.com",
            managerEmails:     [ "jerref@test.com", "silvanus@test.com" ],
            uuid:              'test-006'
        },
        {
            name:          "Islands",
            address:       { street: "20750 Stevens Creek Blvd", city: "Cupertino", state: "CA", zip: "95014" },
            ownerEmails:   [ "carina@test.com" ],
            managerEmails: [ "annegret@test.com", "silvanus@test.com" ],
            uuid:          'test-001'
        }
    ],

    organizations: [
        {
            name:       "Delicious Restaurants",
            email:      "dr@test.com",
            websiteUrl: "www.dr.com",
            address:    { street: "204 California Blvd.", city: "San Luis Obispo", state: "CA", zip: "93405" },
            phone:      1234567890

        }
    ],

    advertisements: [
        {
            name:         "Advertisement One!",
            creatorEmail: "ad@test.com",
            description:  "Still working on this!",
            reviewState:  'Not Submitted'
        },
        {
            name:         "Advertisement Two!",
            creatorEmail: "ad@test.com",
            description:  "I am waiting to be reviewed",
            reviewState:  'Waiting for Review'
        },
        {
            name:         "Advertisement Three!",
            creatorEmail: "elizabeth@test.com",
            description:  "I have been accepted",
            reviewState:  'Accepted'
        },
        {
            name:         "Bear Republic",
            creatorEmail: "ad@test.com",
            description:  "Bear Republic beer",
            reviewState:  'Accepted',
            images:       { widget: 'bearrepublic/bearrepub256.png', crawler: 'bearrepublic/bearrepub440.png' },
            messages:     [ 'Can you Bear it?', 'Bear Republic, some tasty stuff' ]
        },
        {
            name:         "Bud Lite",
            creatorEmail: "ad@test.com",
            description:  "Bud Lite Beer",
            reviewState:  'Accepted',
            images:       { widget: 'budlite/BUD_LIGHT256.png', crawler: 'budlite/BUD_LIGHT440.png' },
            messages:     [ "America's #1 Lite Beer", 'Serve extremely cold', "Have a bud and a smile" ]
        },
        {
            name:         "Blatz",
            creatorEmail: "ad@test.com",
            description:  "Blatz beer",
            reviewState:  'Waiting for Review',
            images:       { widget: 'blatz/blatz256.png', crawler: 'blatz/blatz440.png' },
            messages:     [ 'Is it the worst beer ever? Yes, I think it is.', 'Blatz will make you phatz' ]
        },
        {
            name:         "Brooklyn Brewing",
            creatorEmail: "ad@test.com",
            description:  "Brooklyn Brewing ads",
            reviewState:  'Accepted',
            images:       { widget: 'brooklynbrewing/brooklyn256.png', crawler: 'brooklynbrewing/brooklyn440.png' },
            messages:     [ 'Is it the worst beer ever? Yes, I think it is.', 'Blatz will make you phatz' ]
        },
        {
            name:         "Campbell Brewing",
            creatorEmail: "ad@test.com",
            description:  "Campbell Brewing ads",
            reviewState:  'Accepted',
            images:       {
                widget:  'campbellbrewing/campbellbrew256.png',
                crawler: 'campbellbrewing/campbellbrew440.png'
            },
            messages:     [ 'Tasty beers on Hamilton Ave.', 'Try our amber ale, not too shabby!' ]
        },
        {
            name:         "El Guapo",
            creatorEmail: "ad@test.com",
            description:  "El Guapo ads",
            reviewState:  'Accepted',
            images:       {
                widget:  'elguapo/elguapo256.jpg',
                crawler: 'elguapo/elguapo440.jpg'
            },
            messages:     [ 'Tasty beers on Hamilton Ave.', 'Try our amber ale, not too shabby!' ]
        }
    ]
};
