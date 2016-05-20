/**
 * Created by rhartzell on 5/6/16.
 */



var Promise = require( 'bluebird' );


var self = module.exports.testdata = {
    
    installTestData: true,
    eraseOldData:    false,
    
    install: function() {
        
        if (!self.installTestData) {
            sails.log.debug("Skipping test data installation.");
            return;
        }

        var chain = Promise.resolve();

        if (self.eraseOldData) {
            sails.log.debug("Erasing old test data installation.");

            var destruct = [
                User.destroy( {} ),
                Venue.destroy( {} ),
                Device.destroy( {} )
            ];

            chain = chain.then( function() {
                return Promise.all( destruct )
                    .then( function() {
                        sails.log.debug("All test models destroyed.");
                    });
            })
        }

        self.users.forEach( function(u) {
            var email = u.email;
            var password = u.password;
            delete u.email;
            delete u.password;
            // find role IDs
            u.roles = [];
            u.roleNames.forEach(function(role) {
                u.roles.push(RoleCacheService.roleByName(role.role, role.subRole));
            });
            delete u.roleNames;
            chain = chain.then( function() {
                return AdminService.addUser(email, password, u)
                    .then( function() {
                        sails.log.debug("Created user " + email)
                    })
            })
        });

        self.venues.forEach( function(v) {
            var ownerEmail = v.ownerEmail;
            delete v.ownerEmail;
            
            chain = chain.then(function() {
                return Auth.findOne( {email: ownerEmail} )
                    .then(function(user) {
                        v.venueOwner = user.user;
                        return Venue.create(v)
                                    .then(function () {
                                        sails.log.debug("Venue created with owner " + ownerEmail);
                                    })
                    })
            })
        });

        chain = chain.then( function() {
            return User.find()
                .populate('venues')
                .then( function() {
                    sails.log.debug("Venues populated");
                })
        });

        self.devices.forEach( function(d) {
            var ownerEmail = d.ownerEmail;
            var venueName = d.venueName;
            var managers = d.managerEmails;
            delete d.managerEmails;
            delete d.ownerEmail;
            delete d.venueName;
            var device;
            
            chain = chain.then(function() {
                return Auth.findOne( {email: ownerEmail} )
                    .then( function(user) {
                        d.deviceOwner = user.user;
                        return Venue.findOne( {name: venueName} )
                    })
                    .then( function(venue) {
                        d.venue = venue;
                        return Device.create(d)
                            .then(function(newDev) {
                                device = newDev;
                                sails.log.debug("Device created with owner " + ownerEmail + ", location: " + d.locationWithinVenue);
                            })
                    })
            })

            managers.forEach( function(m) {
                var user;
                chain = chain.then(function() {
                    return Auth.findOne({email: m})
                        .then(function(a) {
                            return User.findOne(a.user);
                        })
                        .then(function(u) {
                            user = u;
                            u.managedDevices.add(device.id);
                            u.save(function(err, s) {});
                            device.deviceManagers.add(user.id);
                            device.save(function(err, s) {});
                        })
                        .then(function() {
                            sails.log.debug("Managers added to device");
                        })
                })
            })
        });
        
        chain = chain.then(function() {
            return User.find()
                .populate('ownedDevices')
                .then( function() {
                    sails.log.debug("Users' owned devices populated");
                })
        });

        chain = chain.then(function() {
            return Venue.find()
                .populate('devices')
                .then( function() {
                    sails.log.debug("Venues' devices populated");
                })
        });

        chain = chain.then(function() {
            return User.find()
                .populate('managedDevices')
                .then( function() {
                    sails.log.debug("Users' managed devices populated");
                })
        });

    },
    users: [
        {
            firstName: 'Ryan',
            lastName: 'Smith',
            email: 'ryan@test.com',
            password: 'pa$$word',
            roleNames: [ { role: "proprietor", subRole: "owner" } ]
        },
        {
            firstName: 'Vid',
            lastName: 'Baum',
            email: 'vid@test.com',
            password: 'pa$$word',
            roleNames: [ { role: "user", subRole: "" } ]
        },
        {
            firstName: 'Silvanus',
            lastName: 'Conner',
            email: 'silvanus@test.com',
            password: 'pa$$word',
            roleNames: [ { role: "proprietor", subRole: "manager" }, { role: "user", subRole: ""} ]
        },
        {
            firstName: 'Kajetan',
            lastName: 'McNeil',
            email: 'kajetan@test.com',
            password: 'pa$$word',
            roleNames: [ { role: "user", subRole: "" } ]
        },
        {
            firstName: 'John',
            lastName: 'Alfredson',
            email: 'john@test.com',
            password: 'pa$$word',
            roleNames: [ { role: "proprietor", subRole: "owner" }, { role: "user", subRole: ""} ]
        },
        {
            firstName: 'Antonina',
            lastName: 'Burton',
            email: 'antonina@test.com',
            password: 'pa$$word',
            roleNames: [ { role: "user", subRole: "" } ]
        },
        {
            firstName: 'Catarina',
            lastName: 'Cvetkov',
            email: 'caterina@test.com',
            password: 'pa$$word',
            roleNames: [ { role: "proprietor", subRole: "manager" } ]
        },
        {
            firstName: 'Joe',
            lastName: 'Rogers',
            email: 'joe@test.com',
            password: 'pa$$word',
            roleNames: [ { role: "user", subRole: "" } ]
        },
        {
            firstName: 'Jerref',
            lastName: 'Gardiner',
            email: 'jerref@test.com',
            password: 'pa$$word',
            roleNames: [ { role: "proprietor", subRole: "manager" }, { role: "user", subRole: ""} ]
        },
        {
            firstName: 'Carina',
            lastName: 'Fay',
            email: 'carina@test.com',
            password: 'pa$$word',
            roleNames: [ { role: "proprietor", subRole: "owner" }, { role: "user", subRole: ""} ]
        },
        {
            firstName: 'Nereus',
            lastName: 'Macar',
            email: 'nereus@test.com',
            password: 'pa$$word',
            roleNames: [ { role: "user", subRole: "" } ]
        },
        {
            firstName: 'Abel',
            lastName: 'Filipovic',
            email: 'abel@test.com',
            password: 'pa$$word',
            roleNames: [ { role: "user", subRole: "" } ]
        },
        {
            firstName: 'Patricia',
            lastName: 'Jarrett',
            email: 'patricia@test.com',
            password: 'pa$$word',
            roleNames: [ { role: "user", subRole: "" } ]
        },
        {
            firstName: 'Unice',
            lastName: 'Ashley',
            email: 'unice@test.com',
            password: 'pa$$word',
            roleNames: [ { role: "proprietor", subRole: "manager" } ]
        },
        {
            firstName: 'Paulene',
            lastName: 'Vogel',
            email: 'vogel@test.com',
            password: 'pa$$word',
            roleNames: [ { role: "proprietor", subRole: "owner" }, { role: "user", subRole: ""} ]
        },
        {
            firstName: 'Sloane',
            lastName: 'Irwin',
            email: 'sloane@test.com',
            password: 'pa$$word',
            roleNames: [ { role: "user", subRole: "" } ]
        },
        {
            firstName: 'Lon',
            lastName: 'Plaskett',
            email: 'lon@test.com',
            password: 'pa$$word',
            roleNames: [ { role: "user", subRole: "" } ]
        },
        {
            firstName: 'Annegret',
            lastName: 'Henderson',
            email: 'annegret@test.com',
            password: 'pa$$word',
            roleNames: [ { role: "proprietor", subRole: "manager" }, { role: "user", subRole: ""} ]
            
        },
        {
            firstName: 'Henderson',
            lastName: 'Reed',
            email: 'hend@test.com',
            password: 'pa$$word',
            roleNames: [ { role: "user", subRole: "" } ]
        },
        {
            firstName: 'Elizabeth',
            lastName: 'Salas', 
            email: 'elizabeth@test.com',
            password: 'pa$$word',
            roleNames: [ { role: "proprietor", subRole: "owner" } ]
        }
    ],
    venues: [
        {
            name: "John's Burgers",
            address: { street: "123 Main St.", city: "Cupertino", state: "CA", zip: 95014 },
            ownerEmail: "john@test.com"
        },
        {
            name: "John's Burgers",
            address: { street: "123 Leff St.", city: "Cupertino", state: "CA", zip: 95014 },
            ownerEmail: "john@test.com"
        },
        {
            name: "Corner Pub",
            address: { street: "1165 13th St.", city: "Boulder", state: "CO", zip: 80302 },
            ownerEmail: "vogel@test.com"
        },
        {
            name: "BBQ 'n Beer",
            address: { street: "1123 Central Ave.", city: "New York City", state: "NY", zip: 10001 },
            ownerEmail: "ryan@test.com"
        },
        {
            name: "New Chicago",
            address: { street: "404 Hidden St.", city: "San Luis Obispo", state: "CA", zip: 93405 },
            ownerEmail: "elizabeth@test.com"
        },
        {
            name: "VJ's",
            address: { street: "12 Hanover Dr.", city: "Cupertino", state: "CA", zip: 95014 },
            ownerEmail: "carina@test.com"
        }
    ],
    devices: [
        {
            name: "Bar Box",
            locationWithinVenue: "bar",
            ownerEmail: "john@test.com",
            venueName: "John's Burgers",
            managerEmails: ["silvanus@test.com", "annegret@test.com"]
        },
        {
            name: "Bar Box",
            locationWithinVenue: "bar",
            ownerEmail: "vogel@test.com",
            venueName: "Corner Pub",
            managerEmails: ["caterina@test.com", "silvanus@test.com"]
        },
        {
            name: "Bar Box",
            locationWithinVenue: "bar",
            ownerEmail: "ryan@test.com",
            venueName: "BBQ 'n Beer",
            managerEmails: ["jerref@test.com", "caterina@test.com"]
        },
        {
            name: "Bar Box",
            locationWithinVenue: "bar",
            ownerEmail: "elizabeth@test.com",
            venueName: "New Chicago",
            managerEmails: ["unice@test.com", "jerref@test.com"]
        },
        {
            name: "Bar Box",
            locationWithinVenue: "bar",
            ownerEmail: "carina@test.com",
            venueName: "VJ's",
            managerEmails: ["annegret@test.com", "unice@test.com"]
        },
        {
            name: "Entrance Box",
            locationWithinVenue: "entrance",
            ownerEmail: "john@test.com",
            venueName: "John's Burgers",
            managerEmails: ["silvanus@test.com", "annegret@test.com"]
        },
        {
            name: "Entrance Box",
            locationWithinVenue: "entrance",
            ownerEmail: "vogel@test.com",
            venueName: "Corner Pub",
            managerEmails: ["caterina@test.com", "silvanus@test.com"]
        },
        {
            name: "Entrance Box",
            locationWithinVenue: "entrance",
            ownerEmail: "ryan@test.com",
            venueName: "BBQ 'n Beer",
            managerEmails: ["jerref@test.com", "caterina@test.com"]
        },
        {
            name: "Entrance Box",
            locationWithinVenue: "entrance",
            ownerEmail: "elizabeth@test.com",
            venueName: "New Chicago",
            managerEmails: ["unice@test.com", "jerref@test.com"]
        },
        {
            name: "Entrance Box",
            locationWithinVenue: "entrance",
            ownerEmail: "carina@test.com",
            venueName: "VJ's",
            managerEmails: ["annegret@test.com", "unice@test.com"]
        }
    ]
};