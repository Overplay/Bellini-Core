/**
 * Created by rhartzell on 5/6/16.
 */



var Promise = require('bluebird');


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
                User.destroy({}),
                Venue.destroy({}),
                Device.destroy({}),
                Media.destroy({})
            ];

            chain = chain.then(function () {
                return Promise.all(destruct)
                    .then(function () {
                        sails.log.debug("All test models destroyed.");
                    });
            })
        }
        self.organizations.forEach(function (o) {
            Organization.findOne(o)
                .then(function(org){
                    if (org){
                        reject(new Error("Organization exists, skipping creation"))
                    }
                    else{
                        return Organization.create(o)
                            .then(function (o) {
                                sails.log.debug("organization created")
                            })
                            .catch(function(err) {
                                sails.log.debug("Organization Error Caught" + err)
                            })
                    }
                })
                .catch(function(err){
                    sails.log.debug(err);
                })

        });

        self.users.forEach(function (u) {
            var email = u.email;
            var password = u.password;
            delete u.email;
            delete u.password;
            // find role IDs
            u.roles = [];
            u.roleNames.forEach(function (role) {
                u.roles.push(RoleCacheService.roleByName(role.role, role.subRole));
            });
            delete u.roleNames;
            if (u.organizationEmail) {
                var organizationEmail = u.organizationEmail;
                chain = chain.then(function () {
                    return Organization.findOne({email: organizationEmail})
                        .then(function (o) {
                            u.organization = o;
                        })
                })
                delete u.organizationEmail;
            }
            chain = chain.then(function () {
                return AdminService.addUser(email, password, u)
                    .then(function () {
                        sails.log.debug("Created user " + email)
                    })
                    .catch(function(err) {
                        sails.log.debug("error caught: " + err)
                    })
            })
        });

        self.advertisements.forEach(function (a) {
            var creatorEmail = a.creatorEmail;
            delete a.creatorEmail;

            chain = chain.then(function () {
                Auth.findOne({email: creatorEmail})
                    .then(function (u) {
                        a.creator = u.user;
                        return Ad.findOne(a)
                            .then(function(ad)
                            {
                                if (ad){
                                    sails.log.debug("Ad exists")
                                    return new Error("Ad already in system")
                                }
                                else {
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

        chain = chain.then(function () {
            return User.find()
                .populate('advertisements')
                .then(function () {
                    sails.log.debug("Advertisements populated");
                })
        });


        self.venues.forEach(function (v) {
            var ownerEmail = v.ownerEmail;
            var managerEmails = v.managerEmails;
            delete v.ownerEmail;
            delete v.managerEmails;
            v.venueOwners = [];
            v.venueManagers = [];

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
                    return Auth.findOne({ email : manager })
                        .then( function (user) {
                            v.venueManagers.push(user.user);
                        })
                })
            })

            chain = chain.then(function () {
                return Auth.findOne({email: ownerEmail})
                    .then(function (user) {
                        //v.venueOwners.push(user.user);
                        //sails.log.debug(v)
                        return Venue.findOne({name: v.name}) //this will work but venues could be double named (not unique)
                            .then(function(ven){
                                //sails.log.debug(ven);
                                if (ven){
                                    sails.log.debug("Venue exists")
                                    return new Error("Venue Exists, skipping creation")
                                }
                                else {
                                    return Venue.create(v)
                                        .then(function (veee) {
                                            User.findOne({id: user.user})
                                                .then(function(u){
                                                    u.ownedVenues.add(veee)
                                                    u.save(function(err){}); //WOW sick 

                                                }
                                            )
                                            sails.log.debug("Venue created with owner " + ownerEmail);
                                        })
                                        .catch(function(err){
                                            sails.log.debug(err)
                                        })
                                }

                            })
                            .catch(function(err){
                                sails.log.debug(err)
                            })

                    })
            })

        });

        chain = chain.then(function () {
            return User.find()
                .populate('ownedVenues')
                .then(function () {
                    sails.log.debug("Owned Venues populated");
                })
        });

        chain = chain.then(function() {
            return User.find()
                .populate('managedVenues')
                .then( function () {
                    sails.log.debug("Managed Venues populated");
                })
        })

        self.devices.forEach(function (d) {
            var venueName = d.venueName; //be careful there can be multiple venues with the same name....
            delete d.venueName;
            var device;

            chain = chain.then(function () {
                return Venue.findOne({name: venueName}) //venues can have the same name!
                    .then(function (venue) {
                        d.venue = venue;
                        //sails.log.debug(d)
                        return Device.findOne({name: d.name, venue: venue.id}) //TODO use venue id and user id
                            .then(function(dev){
                                //sails.log.debug(dev)

                                if(dev){
                                    device = dev;
                                    return new Error("Device Exists, skipping creation")
                                }
                                else {
                                    return Device.create(d)
                                        .then(function (newDev) {
                                            device = newDev;
                                            sails.log.debug("Device created at location: " + d.locationWithinVenue);
                                        })
                                        .catch(function(err){
                                            sails.log.debug(err)
                                        })
                                }

                            })
                            .catch(function(err){
                                sails.log.debug(err)
                            })

                    })
            })
        });

        chain = chain.then(function () {
            return Venue.find()
                .populate('devices')
                .then(function () {
                    sails.log.debug("Venues' devices populated");
                })
        });

    },
    users: [
        {
            firstName: 'Ryan',
            lastName: 'Smith',
            email: 'ryan@test.com',
            password: 'pa$$word',
            roleNames: [{role: "proprietor", subRole: "owner"}]
        },
        {
            firstName: 'Vid',
            lastName: 'Baum',
            email: 'vid@test.com',
            password: 'pa$$word',
            roleNames: [{role: "user", subRole: ""}]
        },
        {
            firstName: 'Silvanus',
            lastName: 'Conner',
            email: 'silvanus@test.com',
            password: 'pa$$word',
            roleNames: [{role: "proprietor", subRole: "manager"}, {role: "user", subRole: ""}]
        },
        {
            firstName: 'Kajetan',
            lastName: 'McNeil',
            email: 'kajetan@test.com',
            password: 'pa$$word',
            roleNames: [{role: "user", subRole: ""}]
        },
        {
            firstName: 'John',
            lastName: 'Alfredson',
            email: 'john@test.com',
            password: 'pa$$word',
            roleNames: [{role: "proprietor", subRole: "owner"}, {role: "user", subRole: ""}]
        },
        {
            firstName: 'Antonina',
            lastName: 'Burton',
            email: 'antonina@test.com',
            password: 'pa$$word',
            roleNames: [{role: "user", subRole: ""}]
        },
        {
            firstName: 'Catarina',
            lastName: 'Cvetkov',
            email: 'caterina@test.com',
            password: 'pa$$word',
            roleNames: [{role: "proprietor", subRole: "manager"}]
        },
        {
            firstName: 'Joe',
            lastName: 'Rogers',
            email: 'joe@test.com',
            password: 'pa$$word',
            roleNames: [{role: "user", subRole: ""}]
        },
        {
            firstName: 'Jerref',
            lastName: 'Gardiner',
            email: 'jerref@test.com',
            password: 'pa$$word',
            roleNames: [{role: "proprietor", subRole: "manager"}, {role: "user", subRole: ""}],
            organizationEmail: "dr@test.com"
        },
        {
            firstName: 'Carina',
            lastName: 'Fay',
            email: 'carina@test.com',
            password: 'pa$$word',
            roleNames: [{role: "proprietor", subRole: "owner"}, {role: "user", subRole: ""}]
        },
        {
            firstName: 'Nereus',
            lastName: 'Macar',
            email: 'nereus@test.com',
            password: 'pa$$word',
            roleNames: [{role: "user", subRole: ""}]
        },
        {
            firstName: 'Abel',
            lastName: 'Filipovic',
            email: 'abel@test.com',
            password: 'pa$$word',
            roleNames: [{role: "user", subRole: ""}]
        },
        {
            firstName: 'Patricia',
            lastName: 'Jarrett',
            email: 'patricia@test.com',
            password: 'pa$$word',
            roleNames: [{role: "user", subRole: ""}]
        },
        {
            firstName: 'Unice',
            lastName: 'Ashley',
            email: 'unice@test.com',
            password: 'pa$$word',
            roleNames: [{role: "proprietor", subRole: "manager"}]
        },
        {
            firstName: 'Paulene',
            lastName: 'Vogel',
            email: 'vogel@test.com',
            password: 'pa$$word',
            roleNames: [{role: "proprietor", subRole: "owner"}, {role: "user", subRole: ""}]
        },
        {
            firstName: 'Sloane',
            lastName: 'Irwin',
            email: 'sloane@test.com',
            password: 'pa$$word',
            roleNames: [{role: "user", subRole: ""}]
        },
        {
            firstName: 'Lon',
            lastName: 'Plaskett',
            email: 'lon@test.com',
            password: 'pa$$word',
            roleNames: [{role: "user", subRole: ""}]
        },
        {
            firstName: 'Annegret',
            lastName: 'Henderson',
            email: 'annegret@test.com',
            password: 'pa$$word',
            roleNames: [{role: "proprietor", subRole: "manager"}, {role: "user", subRole: ""}]

        },
        {
            firstName: 'Henderson',
            lastName: 'Reed',
            email: 'hend@test.com',
            password: 'pa$$word',
            roleNames: [{role: "user", subRole: ""}]
        },
        {
            firstName: 'Elizabeth',
            lastName: 'Salas',
            email: 'elizabeth@test.com',
            password: 'pa$$word',
            roleNames: [{role: "proprietor", subRole: "owner"}],
            organizationEmail: "dr@test.com"
        },
        {
            firstName: 'Advertiser',
            lastName: 'Smith',
            email: 'ad@test.com',
            password: 'pa$$word',
            roleNames: [{role: "advertiser", subRole: ""}]
        }
    ],
    venues: [
        {
            name: "Le Boulanger",
            address: {street: "20488 Stevens Creek Blvd", city: "Cupertino", state: "CA", zip: "95014"},
            ownerEmail: "john@test.com",
            managerEmails: ["silvanus@test.com", "jerref@test.com"]
        },
        {
            name: "Ajito",
            address: {street: "7335 Bollinger Rd", city: "Cupertino", state: "CA", zip: "95014"},
            ownerEmail: "john@test.com",
            managerEmails: ["silvanus@test.com", "unice@test.com"]
        },
        {
            name: "The Sink",
            address: {street: "1165 13th St.", city: "Boulder", state: "CO", zip: "80302"},
            ownerEmail: "vogel@test.com",
            managerEmails: ["annegret@test.com", "caterina@test.com"]
        },
        {
            name: "B Bar & Grill",
            address: {street: "40 E 4th St", city: "New York", state: "NY", zip: "10003"},
            ownerEmail: "ryan@test.com",
            managerEmails: ["unice@test.com", "jerref@test.com"]
        },
        {
            name: "Novo",
            address: {street: "726 Higuera St", city: "San Luis Obispo", state: "CA", zip: "93401"},
            ownerEmail: "elizabeth@test.com",
            organizationEmail: "dr@test.com",
            managerEmails: ["caterina@test.com", "annegret@test.com"]
        },
        {
            name: "Not Your Average Joe's",
            address: {street: "305 Main St", city: "Acton", state: "MA", zip: "01720"},
            ownerEmail: "elizabeth@test.com",
            organizationEmail: "dr@test.com",
            managerEmails: ["jerref@test.com", "silvanus@test.com"]
        },
        {
            name: "Islands",
            address: {street: "20750 Stevens Creek Blvd", city: "Cupertino", state: "CA", zip: "95014"},
            ownerEmail: "carina@test.com",
            managerEmails: ["annegret@test.com", "silvanus@test.com"]
        }
    ],
    devices: [
        {
            name: "Bar Box",
            locationWithinVenue: "bar",
            venueName: "Le Boulanger"
        },
        {
            name: "Bar Box",
            locationWithinVenue: "bar",
            venueName: "The Sink"
        },
        {
            name: "Bar Box",
            locationWithinVenue: "bar",
            venueName: "B Bar & Grill"
        },
        {
            name: "Bar Box",
            locationWithinVenue: "bar",
            venueName: "Not Your Average Joe's"
        },
        {
            name: "Bar Box",
            locationWithinVenue: "bar",
            venueName: "Islands"
        },
        {
            name: "Entrance Box",
            locationWithinVenue: "entrance",
            venueName: "Le Boulanger"
        },
        {
            name: "Entrance Box",
            locationWithinVenue: "entrance",
            venueName: "The Sink"
        },
        {
            name: "Entrance Box",
            locationWithinVenue: "entrance",
            venueName: "B Bar & Grill"
        },
        {
            name: "Entrance Box",
            locationWithinVenue: "entrance",
            venueName: "Not Your Average Joe's"
        },
        {
            name: "Entrance Box",
            locationWithinVenue: "entrance",
            venueName: "Islands"
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
            description: "an ad"
        },
        {
            name: "Advertisement Two!",
            creatorEmail: "ad@test.com",
            description: "anotha one"
        }
        ,
        {
            name: "Advertisement Three!",
            creatorEmail: "elizabeth@test.com",
            description: "noooooo"
        }
    ]
};