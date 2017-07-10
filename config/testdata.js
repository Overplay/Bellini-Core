/**
 * Created by rhartzell on 5/6/16.
 */

//Note: test data will be duplicated if being run on a cluster! 
var moment = require('moment')
var Promise = require('bluebird');
var adName = 'Advertisement One!';
var adDate = 'September 7'; //TODO
var self = module.exports.testdata = {

    installTestData: true,
    eraseOldData: false,

    install: function () {

        if (!self.installTestData) {
            sails.log.debug("Skipping test data installation.");
            return;
        }

        var chain = Promise.resolve();

        if (self.eraseOldData) {
            sails.log.debug("Erasing old test data installation.");

            var destruct = [
                Auth.destroy({}),
                User.destroy({}),
                Venue.destroy({}),
                Media.destroy({}),
                Ad.destroy({})
            ];

            chain = chain.then(function () {
                return Promise.all(destruct)
                    .then(function () {
                        sails.log.debug("All test models destroyed.");
                    });
            })
        }


        self.users.forEach(function (u) {

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
            chain = chain.then(function () {
                return AdminService.addUserAtRing( u.email, u.password, u.ring,
                    { firstName: u.firstName, lastName: u.lastName }, false )
                    .then( function () { sails.log.debug( "User created." )} )
                    .catch( function () { sails.log.warn( "User NOT created. Probably already existed." )} );
            })
        });

        self.advertisements.forEach(function (a) {
            var creatorEmail = a.creatorEmail;
            delete a.creatorEmail;

            chain = chain.then(function () {
                return Auth.findOne({email: creatorEmail})
                    .then(function (u) {
                        a.creator = u.user;
                        return Ad.findOne(a)
                            .then(function (ad) {
                                if (ad) {
                                    sails.log.debug("Ad exists")
                                    return new Error("Ad already in system")
                                }
                                else {
                                    a.advert = {type: '2g3s', media: {crawler: '', widget: ''}, text: ['', '', '']}
                                    return Ad.create(a)
                                        .then(function () {
                                            sails.log.debug("Ad created for " + creatorEmail);
                                        })
                                        .catch(function (err) {
                                            sails.log.debug(err)
                                        })
                                }
                            })

                    })
                    .catch(function (err) {
                        sails.log.debug(err)
                    })
            })


        });


        self.venues.forEach(function (v) {

            var ownerEmails = v.ownerEmails;
            var managerEmails = v.managerEmails;
            delete v.ownerEmails;
            delete v.managerEmails;
            var venueOwners = [];
            var venueManagers = [];

            if (v.organizationEmail) {
                var organizationEmail = v.organizationEmail;
                chain = chain.then(function () {
                    return Organization.findOne({email: organizationEmail})
                        .then(function (o) {
                            v.organization = o;
                        })
                })
                delete v.organizationEmail;
            }

            managerEmails.forEach(function (manager) {
                chain = chain.then(function () {
                    return Auth.findOne({email: manager})
                        .then(function (user) {
                            venueManagers.push(user.user);
                        })
                })
            })

            ownerEmails.forEach(function (owner) {
                chain = chain.then(function () {
                    return Auth.findOne({email: owner})
                        .then(function (user) {
                            venueOwners.push(user.user);
                        })
                })
            })

            // chain = chain.then(function () {
            //     return Auth.findOne({email: ownerEmails[0]}) //dumb fix
            chain = chain.then(function (user) {
                //v.venueOwners.push(user.user);
                //sails.log.debug(venueManagers)
                return Venue.findOne({uuid: v.uuid})
                    .then(function (ven) {
                        //sails.log.debug(ven);
                        if (ven) {
                            sails.log.debug("Venue exists")
                            return new Error("Venue Exists, skipping creation")
                        }
                        else {
                            return Venue.create(v)

                                .then(function (newV) {
                                    //sails.log(newV)
                                    //sails.log(venueManagers)
                                    //sails.log(venueOwners)
                                    newV.venueOwners.add(venueOwners)
                                    newV.save({populate: false}, function (err) {
                                        if (err) sails.log.debug(err)
                                    });
                                    newV.venueManagers.add(venueManagers)
                                    newV.save({populate: false}, function (err) {
                                        if (err) sails.log.debug(err)
                                    });

                                    sails.log.debug("Venue created with name " + newV.name);
                                })
                                .catch(function (err) {
                                    sails.log.debug(err)
                                })
                        }

                    })
                    .catch(function (err) {
                        sails.log.debug(err)
                    })

            })
            // })

        });


    },

    users: [
        {
            firstName: 'Ryan',
            lastName: 'Smith',
            email: 'ryan@test.com',
            password: 'pa$$word',
            ring: 3
        },
        {
            firstName: 'Vid',
            lastName: 'Baum',
            email: 'vid@test.com',
            password: 'pa$$word',
            ring: 3
        },
        {
            firstName: 'Silvanus',
            lastName: 'Conner',
            email: 'silvanus@test.com',
            password: 'pa$$word',
            ring: 3
        },
        {
            firstName: 'Kajetan',
            lastName: 'McNeil',
            email: 'kajetan@test.com',
            password: 'pa$$word',
            ring: 3
        },
        {
            firstName: 'John',
            lastName: 'Alfredson',
            email: 'john@test.com',
            password: 'pa$$word',
            ring: 3
        },
        {
            firstName: 'Antonina',
            lastName: 'Burton',
            email: 'antonina@test.com',
            password: 'pa$$word',
            ring: 3
        },
        {
            firstName: 'Caterina',
            lastName: 'Cvetkov',
            email: 'caterina@test.com',
            password: 'pa$$word',
            ring: 3
        },
        {
            firstName: 'Joe',
            lastName: 'Rogers',
            email: 'joe@test.com',
            password: 'pa$$word',
            ring: 3
        },
        {
            firstName: 'Jerref',
            lastName: 'Gardiner',
            email: 'jerref@test.com',
            password: 'pa$$word',
            ring: 3
        },
        {
            firstName: 'Carina',
            lastName: 'Fay',
            email: 'carina@test.com',
            password: 'pa$$word',
            ring: 3
        },
        {
            firstName: 'Nereus',
            lastName: 'Macar',
            email: 'nereus@test.com',
            password: 'pa$$word',
            ring: 3
        },
        {
            firstName: 'Abel',
            lastName: 'Filipovic',
            email: 'abel@test.com',
            password: 'pa$$word',
            ring: 3
        },
        {
            firstName: 'Patricia',
            lastName: 'Jarrett',
            email: 'patricia@test.com',
            password: 'pa$$word',
            ring: 3
        },
        {
            firstName: 'Unice',
            lastName: 'Ashley',
            email: 'unice@test.com',
            password: 'pa$$word',
            ring: 3
        },
        {
            firstName: 'Paulene',
            lastName: 'Vogel',
            email: 'vogel@test.com',
            password: 'pa$$word',
            ring: 3
        },
        {
            firstName: 'Sloane',
            lastName: 'Irwin',
            email: 'sloane@test.com',
            password: 'pa$$word',
            ring: 3
        },
        {
            firstName: 'Lon',
            lastName: 'Plaskett',
            email: 'lon@test.com',
            password: 'pa$$word',
            ring: 3
        },
        {
            firstName: 'Annegret',
            lastName: 'Henderson',
            email: 'annegret@test.com',
            password: 'pa$$word',
            ring: 3

        },
        {
            firstName: 'Henderson',
            lastName: 'Reed',
            email: 'hend@test.com',
            password: 'pa$$word',
            ring: 3
        },
        {
            firstName: 'Elizabeth',
            lastName: 'Salas',
            email: 'elizabeth@test.com',
            password: 'pa$$word',
            ring: 4
        },
        {
            firstName: 'Advertiser',
            lastName: 'Smith',
            email: 'ad@test.com',
            password: 'pa$$word',
            ring: 4
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
            name: "Blue Line Pizza",
            address: {street: "415 E Campbell Ave", city: "Campbell", state: "CA", zip: "95008"},
            ownerEmails: ["john@test.com"],
            managerEmails: ["silvanus@test.com", "jerref@test.com"],
            uuid: 'test-001'
        },
        {
            name: "Ajito",
            address: {street: "7335 Bollinger Rd", city: "Cupertino", state: "CA", zip: "95014"},
            ownerEmails: ["john@test.com"],
            managerEmails: ["silvanus@test.com", "unice@test.com"],
            uuid:          'test-002'
        },
        {
            name: "The Sink",
            address: {street: "1165 13th St.", city: "Boulder", state: "CO", zip: "80302"},
            ownerEmails: ["vogel@test.com"],
            managerEmails: ["annegret@test.com", "caterina@test.com"],
            uuid:          'test-003'
        },
        {
            name: "B Bar & Grill",
            address: {street: "40 E 4th St", city: "New York", state: "NY", zip: "10003"},
            ownerEmails: ["ryan@test.com"],
            managerEmails: ["unice@test.com", "jerref@test.com"],
            uuid:          'test-004'
        },
        {
            name: "Novo",
            address: {street: "726 Higuera St", city: "San Luis Obispo", state: "CA", zip: "93401"},
            ownerEmails: ["elizabeth@test.com"],
            organizationEmail: "dr@test.com",
            managerEmails: ["caterina@test.com", "annegret@test.com", "silvanus@test.com"],
            uuid:          'test-005'
        },
        {
            name: "Not Your Average Joe's",
            address: {street: "305 Main St", city: "Acton", state: "MA", zip: "01720"},
            ownerEmails: ["elizabeth@test.com"],
            organizationEmail: "dr@test.com",
            managerEmails: ["jerref@test.com", "silvanus@test.com"],
            uuid:          'test-006'
        },
        {
            name: "Islands",
            address: {street: "20750 Stevens Creek Blvd", city: "Cupertino", state: "CA", zip: "95014"},
            ownerEmails: ["carina@test.com"],
            managerEmails: ["annegret@test.com", "silvanus@test.com"],
            uuid:          'test-001'
        }
    ],

    organizations: [
        {
            name: "Delicious Restaurants",
            email: "dr@test.com",
            websiteUrl: "www.dr.com",
            address: {street: "204 California Blvd.", city: "San Luis Obispo", state: "CA", zip: "93405"},
            phone: 1234567890

        }
    ],

    advertisements: [
        {
            name: "Advertisement One!",
            creatorEmail: "ad@test.com",
            description: "Still working on this!",
            reviewState: 'Not Submitted'
        },
        {
            name: "Advertisement Two!",
            creatorEmail: "ad@test.com",
            description: "I am waiting to be reviewed",
            reviewState: 'Waiting for Review'
        }
        ,
        {
            name: "Advertisement Three!",
            creatorEmail: "elizabeth@test.com",
            description: "I have been accepted",
            reviewState: 'Accepted'
        }
    ]
};
