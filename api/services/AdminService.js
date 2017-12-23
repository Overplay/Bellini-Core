/**
 * Created by mkahn on 4/7/16.
 * Common Admin tasks for Waterlock
 *
 */

const _ = require( 'lodash' );
const Promise = require('bluebird');

function random0to9(){
    return _.sample(['0','1','2','3','4','5','6','7','8','9']);
}
//module.exports = require( 'waterlock' ).waterlocked( {

module.exports = {

    /**
     * Adds admin privilege to the account pointed to by emailAddr
     *
     * @param emailAddr
     */
    addAdmin: function ( emailAddr ) {

        return Auth.findOneByEmail( emailAddr )
            .then( function ( auth ) {
                if ( !auth ) {
                    sails.log.error( "Could not upgrade user to Admin, no such email!" );
                    throw new Error( 'no user with that email' );
                }

                sails.log.debug( "Found an auth for email: " + emailAddr );
                auth.ring = 0;
                return auth.save();

            } )
            .catch( function ( err ) {
                sails.log.error( "No email for that user: " + emailAddr );
                reject( err );
            } );

    },

    /**
     * Creates a user with local authentication. You can set the permission level by
     * passing a userObj like { accountType: 'admin' }
     *
     * @param emailAddr
     * @param password
     * @param userObj
     */

    // Backwards compatible call until we go thru all the non-ring code. Creates a regular user.
    addUser: function ( emailAddr, password, userObj, facebookId, requireValidation ) {

        return module.exports.addUserAtRing( emailAddr, password, 3, userObj, facebookId, requireValidation )

    },

    addUserAtRing: function ( emailAddr, password, ring, userObj, facebookId, requireValidation ) {

        const authAttrib = {
            email:    emailAddr,
            password: password,
            ring:     ring
        };

        if ( facebookId && typeof facebookId !== 'undefined' )
            authAttrib.facebookId = facebookId;

        requireValidation = requireValidation || sails.config.waterlock.alwaysValidate;

        // TODO check on facebook id too?? I think that facebook auth with login if found automatically -CG
        // rewritten massively by MAK 4-2017 and again 9-2017
        return Auth.findOne( { email: emailAddr } )
            .then( function ( auth ) {
                if ( auth ) {
                    sails.log.debug( "Email " + emailAddr + " is in system, rejecting create." )
                    throw new Error( "Email already in system" );
                }

                sails.log.debug( "Adding user for: " + emailAddr );
                // in the unlikely event this fails, it is caught by the caller
                return User.create( userObj || {} );
            } )
            .then( function ( newUser ) {
                // have to wrap up the old-skool method
                return new Promise( function ( resolve, reject ) {
                    waterlock.engine.attachAuthToUser( authAttrib, newUser, function ( err, userWithAuth ) {
                        if ( err ) {
                            sails.log.error( 'AdminService.addUser: Error attaching auth to user' );
                            sails.log.error( err );
                            reject( err );
                        }

                        resolve( userWithAuth );

                    } );
                } ); // end Promise
            } )
            .then( function ( userWithAuth ) {

                var outroPromises = [ Promise.resolve( userWithAuth ) ];

                // if validation is required, add this extra promise
                if ( requireValidation ) {
                    sails.log.info( "AdminService.addUser: adding validation token" );
                    outroPromises.push( ValidateToken.create( { owner: userWithAuth.auth.id } )
                        .then( function ( tok ) {
                            return Auth.update( { id: tok.owner }, {
                                validateToken: tok,
                                blocked:       true
                            } );
                        } ) );

                }

                return Promise.all(outroPromises);

            } )
            .then( (results) => {
                return results[0]; // just the userWithAuth
            });


    },

    /**
     * Change the password for a specific email address
     *
     * @param params { password: "password", email | token: "value" }
     *
     */
    changePwd: function ( params ) {

        if ( !params.password ) {
            return Promise.reject( new Error( "Try including a password!" ) );
        }

        if ( params.email ) {

            return Auth.findOneByEmail( params.email )
                .then( function ( authObj ) {

                    if ( !authObj ) {
                        throw new Error( 'no such email' );
                    }

                    authObj.password = params.password;
                    return authObj.save();

                } )


        } else if ( params.resetToken ) {

            // Token is stored on the Auth resetToken.token

            // TODO I think this is broken, the param below does not match!
            return Auth.find( { resetToken: { "!": null  } })
                .then( function ( authObjs ) {

                    if (!authObjs || !authObjs.length ){
                        return Promise.reject( new Error( "Invalid token (1)" ) );
                    }

                    let authToReset = _.find(authObjs, function(auth){
                        const token = auth.resetToken && auth.resetToken.token;
                        if (!token) return false;
                        return token === params.resetToken;
                    });

                    if (authToReset){
                        authToReset.password = params.password;
                        return authToReset.save()
                    }

                    return Promise.reject( new Error( "Invalid token (2)" ) );

                } );

        }

        return Promise.reject( new Error( 'bad params' ) ); //fixes promise handler warning

    },

    sixRandomDigits: function(){
        return random0to9()+random0to9()+random0to9()+random0to9()+random0to9()+random0to9();
    }

    //});
}