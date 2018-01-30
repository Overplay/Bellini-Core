/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.bootstrap.html
 */

var Promises = require( 'bluebird' );


module.exports.bootstrap = function ( cb ) {

    //TwilioService.sendText('4088383673','Yo Dawg!');

    const WACK_ADMINS_FIRST = false; // only use this if you've corrupted the ring for admin

    var coreAdmins = [

        {
            user: {
                firstName: 'Admin',
                lastName:  'Pukeface',
                metadata:  { preinstall: true }
            },
            auth: {
                email:    'admin@test.com',
                password: 'beerchugs'
            }
        },
        {
            user: {
                firstName: 'Mitch',
                lastName:  'Kahn',
                metadata:  { preinstall: true }
            },
            auth: {
                email:    'mitcha@ourglass.tv',
                password: 'D@rkB0ck!'
            }
        },
        {
            user: {
                firstName: 'Treb',
                lastName:  'Ryan',
                metadata:  { preinstall: true },
            },
            auth: {
                email:    'treba@ourglass.tv',
                password: 'D@rkB0ck!'
            }
        }

    ];

    function makeCoreAdmins() {
        coreAdmins.forEach( function ( admin ) {
            AdminService.addUserAtRing( admin.auth.email, admin.auth.password, 1, admin.user, false )
                .then( function () { sails.log.debug( "Admin user created." )} )
                .catch( function ( err ) {
                        sails.log.warn( "Admin user NOT created. Probably already existed." )
                    }
                );
        } );
    }


    if (WACK_ADMINS_FIRST){
        Auth.destroy( {} )
            .then( function () {
                return User.destroy( {} );
            } )
            .then( function () {
                makeCoreAdmins();
            } )
    } else {
        makeCoreAdmins();
    }

   Venue.updateOrCreate( { name: 'Bullpen', uuid: 'bullpen-hey-battabatta', virtual: true },
        {
            name:    'Bullpen', uuid: 'bullpen-hey-battabatta',
            virtual: true, showInMobileApp: false
        } );


    sails.config.testdata.install(false);

    sails.log.debug( "Bootstrapping SAILS done" );

    cb();
}
;
