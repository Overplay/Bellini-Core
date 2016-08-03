/**
 * AuthController
 *
 * @module      :: Controller
 * @description    :: Provides the base authentication
 *                 actions used to make waterlock work.
 *
 * @docs        :: http://waterlock.ninja/documentation
 */

var wl = require('waterlock-local-auth')
var jwt = require('jwt-simple')


module.exports = require( 'waterlock' ).waterlocked( {

    //returns the session user 
    status: function ( req, res ) {

        if ( req.session && req.session.user )
            return res.json( req.session.user );
        else
            return res.forbidden();

    },

    // Show the login page from a template
    loginPage: function ( req, res ) {

        res.view('users/login' + ThemeService.getTheme());

    },

    signupPage: function (req, res) {

        res.view('users/signup' + ThemeService.getTheme());
    },

    /**
     * Does the same stuff as the built-in waterlock logout,
     * but lets us do a redirect that won't affect REST usage.
     *
     * @param req
     * @param res
     */
    logoutPage: function ( req, res ) {

        delete( req.session.user );
        req.session.authenticated = false;
        res.redirect( '/' );

    },

    changePwd: function ( req, res ) {

        var params = req.allParams();

        if ( params.newpass === undefined ) {
            // Must have a password or this is a waste of time
            res.badRequest();

        } else if ( params.email ) {

            // Email based reset
            AdminService.changePwd( { email: params.email, password: params.newpass } )
                .then( function () {
                    return res.json( { "message": "Password changed" } );
                } )
                .catch( function ( err ) {
                    return res.error( err );
                } )

        } else if ( params.resetToken ) {

            // Attempt at token based reset. Let's make sure they are really cool
            if ( params.resetToken != req.session.resetToken.token ) {
                return res.forbidden();
            }

            AdminService.changePwd( { resetToken: params.resetToken, password: params.newpass } )
                .then( function () {
                    return res.json( { "message": "Password changed" } );
                } )
                .catch( function ( err ) {
                    return res.error( err );
                } )


        } else {
            res.badRequest();
        }


    },


    /*addRole: function ( req, res ) { MOVED TO USERCONTROLLLER

        var params = req.allParams();

     if ( !params.id ) {
            res.badRequest();
        } else {
            AdminService.changePwd( params.email, params.newpass )
                .then( function () {
                    return res.json( { "message": "Password changed" } );
                } )
                .catch( function ( err ) {
                    return res.error( err );
                } )
        }

     },*/

    addUser: function ( req, res ) {
        //sails.log.debug(req)
        var params = req.allParams();


        //handle no password if facebook 
        if ( ( params.email === undefined) || (params.password === undefined) || (params.user === undefined) )
            return res.badRequest();

        //HUGE security hole if someone tries to add themself as an OG 
        if (params.user.roleNames) {
            params.user.roles = [];
            async.forEach(params.user.roleNames, function (name) {
                params.user.roles.push(RoleCacheService.roleByName(name))
            })
            delete params.user.roleNames;

        }
        
        //TODO get the venue managers and owners here for the new user 

        AdminService.addUser(params.email, params.password, params.user, params.facebookId, params.validate) //TRUE requires validation
            .then( function ( data ) {
                //sails.log.debug(data)
                return res.ok()

            } )
            .catch( function ( err ) {
                //sails.log.debug(err)
                return res.badRequest( err );
            } )


    },


    signupPage: function ( req, res ) {

        if (req.allParams().token) {
            var decoded = jwt.decode(req.allParams().token, sails.config.jwt.secret)
            sails.log.debug(decoded)
            var auth = {
                email: decoded.email
            }


            //handle roles from the venue invite, just in case we use this 
            //for advertiser invites in the future etc 


            //owned and managedVenues TODO 
            var userObj = {
                roleNames: [decoded.role == "Manager" ? "proprietor.manager" : "proprietor.owner"],

                //TODO venues managed or whatever and use the add/save method ugh lol 
            }

            return res.view('users/signup' + ThemeService.getTheme(), {
                data: JSON.stringify({
                    auth: auth,
                    user: userObj,
                    type: 'invite'
                })
            });


        }
        else
            return res.view('users/signup' + ThemeService.getTheme());

    },

    resetPwd: function ( req, res ) {

        return res.view('users/resetPassword' + ThemeService.getTheme());

    },

    validatedOk: function ( req, res ) {

        return res.view('users/validationOk' + ThemeService.getTheme());
    }


} );