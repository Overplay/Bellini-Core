/**
 * Created by mkahn on 4/7/16.
 * Common Admin tasks for Waterlock
 * 
 */

var _ = require('lodash');

var _authRoleId = undefined;

function getAuthRole(){

    // If we already have it, just return it
    if (_authRoleId){
        return new Promise.resolve(_authRoleId);
    }

    return new Promise( function( resolve, reject ){

        Role.findOneByRoleName('admin')
            .then( function(role){
                _authRoleId = role.id; // remember it
                resolve( role.id ) ;
            })
            .catch( function(err){
                log.error("MAJOR problem getting auth role, is DB corrupt?");
                reject(err);
            })

    })
}

function attachAdminToAuth( authObj ) {

    return new Promise( function ( resolve, reject ) {

        getAuthRole()
            .then( function(authRoleId) {

                User.findOneById( authObj.user )
                    .then( function ( user ) {
                        user.accountType = 'admin';
                        user.roles = _.union( user.roles, [ authRoleId ]);
                        user.save();
                        resolve( user );
                    } )
                    .catch( reject );

            } )
            .catch( reject );  //bubble it up, but this should not ever occur


    } )
}


module.exports = require( 'waterlock' ).waterlocked( {


    /**
     * Adds admin privledge to the account pointed to by emailAddr
     *
     * @param emailAddr
     */
    addAdmin: function ( emailAddr ) {

        return new Promise( function ( resolve, reject ) {
            "use strict";

            Auth.findOneByEmail( emailAddr )
                .then( function ( auth ) {
                    sails.log.debug( "Found an auth for email: " + emailAddr );
                    attachAdminToAuth( auth )
                        .then( resolve )
                        .catch( reject )

                } )
                .catch( function ( err ) {
                    sails.log.error( "No email for that user: " + emailAddr );
                    reject( err );
                } )

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
     
     // TODO: This should do a check before attempting create to keep the log noise level down :)
    addUser: function ( emailAddr, password, userObj, requireValidation ) {

        return new Promise( function ( resolve, reject ) {

            var auth = {
                email:    emailAddr,
                password: password
            };

            requireValidation = requireValidation || sails.config.waterlock.alwaysValidate;

            User.create( userObj || {} )
                .then( function ( user ) {

                    waterlock.engine.attachAuthToUser( auth, user, function ( err, userWithAuth ) {
                        if ( err ) {
                            waterlock.logger.error( 'error making user' );
                            sails.log.error( err );
                            reject( err );
                        } else {
                            if (requireValidation){
                                
                                ValidateToken.create( { owner: userWithAuth.auth.id } )
                                    .then( function ( tok ) {
                                        sails.log.info( tok );
                                        Auth.update( { id: tok.owner }, { validateToken: tok, blocked: true } )
                                            .then( function ( data ) {
                                                sails.log.debug( "Back attach of validateToken OK" );
                                            } )
                                    } )
                                    .catch( function ( err ) {
                                        sails.log.error( err );
                                    } );
                            
                            
                            }
                            
                            resolve( userWithAuth );
                        }
                    } )

                } )
                .catch( reject )

        } )

    },

    /**
     * Change the password for a specific email address
     *
     * @param params { password: "password", email | token: "value" }
     *
     */
    changePwd: function ( params ) {

        return new Promise( function ( resolve, reject ) {

            if (!params.password){
                reject( new Error("Try including a password!") );
            }

            if ( params.email ){

                Auth.findOneByEmail( params.email )
                    .then( function ( authObj ) {
                        authObj.password = params.password;
                        authObj.save()
                            .then( function ( authObjNew ) {
                                resolve();
                            } )
                            .catch( reject );

                    } )
                    .catch( reject );


            } else if (params.resetToken){

                // Token is stored on the Auth resetToken.token

                Auth.findOne( { "resetToken.token" : params.token })
                    .then( function ( authObj ) {
                        authObj.password = params.password;
                        authObj.save()
                            .then( function ( authObjNew ) {
                                resolve();
                            } )
                            .catch( reject );

                    } )
                    .catch( reject );

            }



        } );

    }




} )
;